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
  var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
  });
};

//is is the main module similar to python __main__
if (require.main === module) {
  main();
}
