/**
 * Created by Samuel Gratzl on 29.05.2015.
 */
/*global require, module, console*/
'use strict';

//console.log('index.js 4');
var fs = require('fs');
// global variables
var datasetRouter = require('express').Router();
var idtypeRouter = require('express').Router();


var datasetsPromise = require('./config').findDataDirs().then(function(dirs) {
  console.log(dirs);
  var datasets = [];
  dirs.forEach(function(dir) {
    var list = JSON.parse(fs.readFileSync(dir+'/data/index.json'));
    list.forEach(function(f) {
      f.path = dir + '/data/' + f.path;
      f.id = datasets.length;
      datasets.push(f);
    });
  });
  console.log(JSON.stringify(datasets));
  return datasets;
});
var idtypesPromise = require('./config').findDataDirs().then(function(dirs) {
  var idtypes = {};
  dirs.forEach(function(dir) {
    var list = JSON.parse(fs.readFileSync(dir+'/data/idtypes.json'));
    list.forEach(function(f) {
      idtypes[f.id] = f;
    });
  });
  return Object.keys(idtypes).map(function(id) { return idtypes[id]; });
});

var idsmapping = {};

idtypeRouter.route('/')
  .all(function (req, res, next) {
    console.log(req.originalUrl);
    next();
  })
  .get(function (req, res) {
    idtypesPromise.then(function(idtypes) {
      res.json(idtypes);
    });
  });

module.exports.IDTypeRouter = idtypeRouter;
function mapIds(ids, idtype) {
  if (!idsmapping.hasOwnProperty(idtype)) {
    idsmapping[idtype] = ids;
    //1 to 1 mapping
    return Array.apply(null, {length: ids.length}).map(Number.call, Number);
  }
  var cache = idsmapping[idtype];
  return ids.map(function (id) {
    var i = cache.indexOf(id);
    if (i < 0) { //not yet part of
      cache.push(id);
      i = cache.length - 1;
    }
    return i;
  });

};
module.exports.map = mapIds;

datasetRouter.param('dataset_id', function (req, res, next, id) {
  datasetsPromise.then(function(datasets) {
    var desc = datasets[id];
    if (desc) {
      req.dataset = [];
      //console.log('index.js 15');
      console.log('loading', desc.path)
      require('./csv').load(desc, function (data) {
        console.log('loaded', desc.path)
        //console.log('index.js 17');
        data.rowIds = mapIds(data.rows, desc.rowtype || desc.idtype);
        if (desc.coltype) {
          data.colIds = mapIds(data.cols, desc.coltype);
        }
        if (desc.type === 'vector') {
          data.data = data.data.map(function (row) { return row[0]; });
        }
        req.dataset = data;
        //console.log('index.js 26');
        next();
      });
    } else {
      return next(new Error('Unknown dataset id "' + id + '".'));
    }
  });
});

datasetRouter.route('/:dataset_id')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    console.log(req.originalUrl);
    next();
  })
  .get(function (req, res, next) {
    // validate query
    if (req.query.start < 0 || req.query.start >= req.dataset.nrow) {
      next(new Error('"start" has to be larger than 0 and smaller than ' + req.dataset.nrow + '.'));
    }

    if (req.query.end < 0 || req.query.end >= req.dataset.nrow) {
      next(new Error('"end" has to be larger than 0 and smaller than ' + req.dataset.nrow + '.'));
    }

    if (req.query.start > req.query.end) {
      next(new Error('"start" must not be larger than "end".'));
    }
    //console.log('index.js 53');

    // apply query
    if (req.query.start && req.query.end) {
      res.json(req.dataset.rslice(req.query.start, req.query.end));
    } else if (req.query.start && !req.query.end) {
      res.json(req.dataset.rslice(req.query.start));
    } else if (!req.query.start && req.query.end) {
      res.json(req.dataset.rslice(0, req.query.end));
    } else {
      res.json(req.dataset);
    }
  });

datasetRouter.route('/')
  .all(function (req, res, next) {
    console.log(req.originalUrl);
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .get(function (req, res) {
    console.log(req.query.ws);
    var ws = req.query.ws || '';
    datasetsPromise.then(function (datasets) {
      var data = datasets.filter(function(item) {
        return (!item.ws && ws === '') || (item.ws && item.ws.match(ws));
      });
      res.json(data);
    });
  });
module.exports.DataSetRouter = datasetRouter;
