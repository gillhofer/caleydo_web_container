/*global require, module, console*/
'use strict';
// external libraries
var express = require('express');
var fs = require('fs');
// application
var app = express();

var staticDirs = [ process.cwd() + '/plugins/', process.cwd() + '/external/', process.cwd() + '/test/'];

var contextPath = '/';

app.get(contextPath + 'api/about', function (req, res) {
  res.send(require('../package.json'));
});
app.use(contextPath + 'api/dataset', require('./dataset').Router);
app.use(contextPath + 'api/idtype', require('./idtypes').Router);
app.use(contextPath + 'api/mapper', require('./mapper').Router);


//if it is the root then try to generate a list of apps and redirect to the only one found if just one is there
app.get(contextPath, function (req, res, next) {
  require('./pluginconfig').findApps().then(function (apps) {
    if (apps.length === 1) {
      //redirect to the only one
      res.redirect('/' + apps[0] + '/');
    } else {
      //generate a list of all known one
      var text = ['<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title>Caleydo Web Apps</title></head><body><h1>Caleydo Web Apps</h1><ul>'];
      apps.forEach(function (app) {
        text.push('<li><a href="/' + app + '/">' + app + '</a></li>');
      });
      text.push('</li></body></html>');
      res.send(text.join('\n'));
    }
  });
});
//generate the config on the fly
app.get(contextPath + 'config-gen.js', function (req, res, next) {
  console.log(JSON.stringify(req.query));
  var app = req.query.app || './main';
  require('./pluginconfig').gen({
    mainFile: app,
    baseUrl : contextPath.substr(1),
    configPrefix: '../'
  }).then(function (config) {
    res.send(config);
    next();
  });
});
//deliver bower
app.use(contextPath + 'bower_components', express.static(process.cwd() + '/bower_components/'));

//deliver any other file as part of a plugin
app.use(/\/(.*)/, function (req, res) { //serve and check all files at two different locations
  var name = req.params[0];
  console.log('requesting ' + name);
  var i, path;
  for (i = 0; i < staticDirs.length; ++i) {
    path = staticDirs[i] + name;
    if (fs.existsSync(path)) {
      res.sendFile(path);
      return;
    }
  }
  res.send(404);
});

module.exports = app;

var main = function () {
  //process.env.PORT set by heroku
  var port = process.env.PORT || 9000;
  console.log('port: ', process.env.PORT, 9000, port);
  var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
  });
};

//is is the main module similar to python __main__
if (require.main === module) {
  console.log('running as main');
  main();
} else {
  console.log('running as slave');
}
