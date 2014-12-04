/**
 * Created by AK113797 on 04.12.2014.
 */
/*global require, module, console*/
'use strict';
var fs = require('fs');
var router = require('express').Router();

var scriptDirs = [ process.cwd() + '/static/scripts/', process.cwd() + '/external/'];

router.route('/config-gen.js').get(function (req, res, next) {
  console.log(JSON.stringify(req.query));
  var app = req.query.app || './main';
  require('./pluginconfig').gen({
    mainFile: app
  }).then(function (config) {
    res.send(config);
    next();
  });
});
router.route(/\/(.*)/)
  .get(function (req, res) {
    var name = req.params[0];
    var i, path;
    for (i = 0; i < scriptDirs.length; ++i) {
      path = scriptDirs[i] + name;
      if (fs.existsSync(path)) {
        res.sendFile(path);
        return;
      }
    }
    res.status(404);
  });

module.exports.Router = router;
