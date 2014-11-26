/*global require, module, console*/
'use strict';
// external libraries
var express = require('express');
var fs = require('fs');
// application
var app = express();

var dirs = [ process.cwd() + '/static/', process.cwd() + '/test/'];

app.get('/api/about', function (req, res) {
  res.send(require('../package.json'));
});
app.use('/api/dataset', require('./dataset').Router);
app.use('/api/idtype', require('./idtypes').Router);
app.use('/api/mapper', require('./mapper').Router);
app.use(/\/(.*)/, function (req, res) { //serve and check all files at two different locations
  var name = req.params[0];
  var i, path;
  for (i = 0; i < dirs.length; ++i) {
    path = dirs[i] + name;
    console.log('test', path);
    if (fs.existsSync(path)) {
      res.sendFile(path);
      return;
    }
  }
  res.status(403).send('Not found: ' + name);
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
