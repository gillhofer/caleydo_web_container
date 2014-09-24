/**
 * Created by Samuel Gratzl on 08.09.2014.
 */
/*global require, module, console*/
'use strict';
var router = require('express').Router();

router.route('/map').get(function (req, res) {
  var source = req.query.source;
  var target = req.query.target;
  var range = req.query.range;

  //TODO peform the mapping

  res.json({
    source: source,
    target: target,
    query: range,
    range: range
  });
});

module.exports.Router = router;