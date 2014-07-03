// external libraries
var express = require('express');
var csv = require("fast-csv");

// global variables
var datasetBasePath = "./data/";
var datasetIndex = undefined;

// application
var app = express();
var datasetRouter = express.Router();


app.get('/about', function(req, res){
  res.send(require('./package.json'));
});


datasetRouter.param('dataset_id', function(req, res, next, id) {
  if ( datasetIndex[id] ) {
    req.dataset = [];
  
    csv
      .fromPath(datasetBasePath + datasetIndex[id].path)
      .on("record", function(data){
        req.dataset.push(data);
      })
      .on("end", function(){
        console.log(req.dataset);
        console.log( 'Successfully parsed dataset ' + datasetIndex[id].name + ' from ' + (datasetBasePath + datasetIndex[id].path) + '!' );
        next();
      });
  }
  else {
    return next(new Error('Unknown dataset id "' +  id + '".' ));
  }
});

datasetRouter.route('/:dataset_id')
  .all(function(req, res, next) {
    // runs for all HTTP verbs first
    console.log( req.originalUrl );
    next();
  })
  .get(function(req, res, next) {
    // validate query
    if ( req.query.start < 0 || req.query.start >= req.dataset.length ) {
      next(new Error('"start" has to be larger than 0 and smaller than ' + req.dataset.length + '.' ));
    }

    if ( req.query.end < 0 || req.query.end >= req.dataset.length ) {
      next(new Error('"end" has to be larger than 0 and smaller than ' + req.dataset.length + '.' ));
    }

    if ( req.query.start > req.query.end ) {
      next(new Error('"start" must not be larger than "end".'));
    }

    // apply query
    if ( req.query.start && req.query.end ) {
      res.json(req.dataset.slice(req.query.start,req.query.end));
    }
    else if ( req.query.start && !req.query.end ) {
      res.json(req.dataset.slice(req.query.start));
    }
    else if ( !req.query.start && req.query.end ) {
      res.json(req.dataset.slice(0,req.query.end));
    }
    else {
      res.json(req.dataset);
    }
  });

datasetRouter.route('/')
  .all(function(req, res, next) {
    console.log( req.originalUrl );
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .get(function(req, res, next) {
    res.json(datasetIndex);
  });

app.use('/dataset',datasetRouter);
app.use('/', express.static('static'));


var indexDatasets = function(indexFile) {
  // expects an array of {name: <dataset name>, path: <relative path to datafile>} pairs
  datasetIndex = require(indexFile);

  for ( var i  = 0; i < datasetIndex.length; ++i ) {
    datasetIndex[i].id = i;
  }

  console.log( datasetIndex );
}

var server = app.listen( 3000, function() {
    indexDatasets( ( datasetBasePath + 'dataset_index.json' ) );
    console.log('Indexed datasets from ' + ( datasetBasePath + 'dataset_index.json' ));
    console.log('Listening on port %d', server.address().port);
});