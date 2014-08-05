/*global require, module, console*/
'use strict';

// global variables
var datasetIndex = [];
module.exports = require('express').Router();

module.exports.param('dataset_id', function (req, res, next, id) {
  var desc = datasetIndex[id];
  if (desc) {
    req.dataset = [];
    desc.load(function (data) {
      req.dataset = data;
      next();
    });
  } else {
    return next(new Error('Unknown dataset id "' + id + '".'));
  }
});

module.exports.route('/:dataset_id')
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

module.exports.route('/')
  .all(function (req, res, next) {
    console.log(req.originalUrl);
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .get(function (req, res) {
    res.json(datasetIndex);
  });


// Load `*.js` under current directory in a module list
require('fs').readdirSync(__dirname + '/').forEach(function (file) {
  var module;
  if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
    //var name = file.replace('.js', '');
    //load module and list all files
    module = require('./' + file);
    module.list().forEach(function (desc) {
      desc.load = function (callback) { //loader helper
        return module.load(desc, callback);
      };
      desc.id = datasetIndex.length; //assign unique id
      desc.uri = '/api/dataset/'+desc.id; //FIXME dynamic prefix
      datasetIndex.push(desc);
    });
  }
});