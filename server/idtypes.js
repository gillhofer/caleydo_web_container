/**
 * Created by Samuel Gratzl on 08.09.2014.
 */
/*global require, module, console*/
'use strict';
var fs = require('fs');

var router = require('express').Router();

var idtypes = JSON.parse(fs.readFileSync('./data/idtypes.json'));

var idsmapping = {};

router.route('/')
  .all(function (req, res, next) {
    console.log(req.originalUrl);
    next();
  })
  .get(function (req, res) {
    res.json(idtypes);
  });

router.route('/:dataset_id')
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

module.exports.Router = router;
module.exports.map = function (ids, idtype) {
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