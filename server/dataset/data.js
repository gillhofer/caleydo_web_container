/*global exports*/
/**
 * Created by Samuel Gratzl on 09.07.2014.
 */

// external libraries
var csv = require('fast-csv');
var fs = require('fs');

var matrix = require('../matrix');

var datasetBasePath = './data/';

//list function returns the description objects of all known datasets
exports.list = function () {
  // expects an array of {name: <dataset name>, path: <relative path to datafile>} pairs
  //since the server is in a sub directory
  var datasetIndex = JSON.parse(fs.readFileSync(datasetBasePath + 'index.json'));
  return datasetIndex;
};

function convertData(data) {
  return matrix.create({
    cols: data[0].slice(1),
    rows: data.slice(1).map(function (row) {
      return row[0];
    }),
    data: data.slice(1).map(function (row) {
      return row.slice(1);
    })
  });
}

function isNumeric(obj) {
  return (obj - parseFloat(obj) + 1) >= 0;
}

//load a specific dataset
exports.load = function (desc, callback) {
  var dataset = [];
  csv
    .fromPath(datasetBasePath + desc.path, {
      ignoreEmpty: true,
      delimiter: desc.separator || ',',
      trim: true,
      comment: '#'
    })
    .on('record', function (data) {
      dataset.push(data.map(function (elem) {
        if (isNumeric(elem)) {
          return parseFloat(elem);
        }
        return elem;
      }));
    })
    .on('end', function () {
      //console.log(dataset);
      console.log('Successfully parsed dataset ' + desc.name + ' from ' + (datasetBasePath + desc.path) + '!');
      callback(convertData(dataset));
    });
};