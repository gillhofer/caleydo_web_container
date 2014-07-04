/*global require, module, console*/
'use strict';
// external libraries
var express = require('express');

// application
var app = express();
var datasetRouter = require('./dataset');


app.get('/api/about', function (req, res) {
  res.send(require('../package.json'));
});
app.use('/api/dataset', datasetRouter);
app.use('/', express.static('static'));

module.exports = app;

var main = function () {
  var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
  });
};

if (require.main === module) {
  main();
}
