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