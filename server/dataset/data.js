/*global exports*/
/**
 * Created by Samuel Gratzl on 09.07.2014.
 */

// external libraries
var csv = require('fast-csv');
var fs = require('fs');

var datasetBasePath = './data/';

//list function returns the description objects of all known datasets
exports.list = function () {
  // expects an array of {name: <dataset name>, path: <relative path to datafile>} pairs
  //since the server is in a sub directory
  var datasetIndex = JSON.parse(fs.readFileSync(datasetBasePath + 'dataset_index.json'));
  return datasetIndex;
};

//load a specific dataset
exports.load = function (desc, callback) {
  var dataset = [];
  csv
    .fromPath(datasetBasePath + desc.path)
    .on('record', function (data) {
      dataset.push(data);
    })
    .on('end', function () {
      console.log(dataset);
      console.log('Successfully parsed dataset ' + desc.name + ' from ' + (datasetBasePath + desc.path) + '!');
      callback(dataset);
    });
};