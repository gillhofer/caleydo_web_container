/*global require, module, console*/
'use strict';
// external libraries
var express = require('express');

// application
var app = express();

app.get('/api/about', function (req, res) {
  res.send(require('../package.json'));
});
app.use('/api/dataset', require('./dataset').Router);
app.use('/api/idtype', require('./idtypes').Router);
app.use('/api/mapper', require('./mapper').Router);
app.use('/', express.static('static'));

module.exports = app;

var main = function () {
  //process.env.PORT set by heroku
  console.log('port: ', process.env.PORT, 8080);
  var server = app.listen(process.env.PORT | 8080, function () {
    console.log('Listening on port %d', server.address().port);
  });
};

//is is the main module similar to python __main__
if (require.main === module) {
  console.log('running as main');
  main();
} else {
  console.log('running as slave', require.main, module.parent);
}
