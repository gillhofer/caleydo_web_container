/*global exports*/
/**
 * Created by Samuel Gratzl on 09.07.2014.
 */

// external libraries
var csv = require('fast-csv');
var fs = require('fs');

var matrix = require('./matrix');

function convertToStratification(data) {
  var d = data.slice(1).map(function (row, i) {
      return { row: row[0], i : i, cluster : row[1] };
    });
  d = d.sort(function(a,b) {
    var r = a.cluster - b.cluster;
    return r === 0 ? a.row - b.row : r;
  }); //sort by cluster;
  //console.log(JSON.stringify(d,null,' '));
  var clusters = {

  };
  d.forEach(function(di) {
    var c = di.cluster;
    if (clusters.hasOwnProperty(c)) {
      clusters[c].push(di.i);
    } else {
      clusters[c] = [di.i];
    }
  });
  clusters = Object.keys(clusters).map(function(clustername) {
    return { name: clustername, range : clusters[clustername] };
  });
  //console.log(JSON.stringify(clusters,null,' '));
  return {
    rows: data.slice(1).map(function(di) { return di[0]}),
    groups: clusters
  };
}

function convertData(desc, data) {
  if (desc.type === 'stratification') {
    return convertToStratification(data);
  }
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
  //console.log('data.js 73',datasetBasePath + desc.path);
  var dataset = [];
  csv
    .fromPath(desc.path, {
      ignoreEmpty: true,
      delimiter: desc.separator || ',',
      trim: true,
      comment: '#'
    })
    .on('error', function(error) {
      console.error(error);
    })
    .on('data', function (data) {
      //console.log('entry',data);
      dataset.push(data.map(function (elem) {
        if (isNumeric(elem)) {
          return parseFloat(elem);
        }
        return elem;
      }));
    })
    .on('end', function () {
      callback(convertData(desc, dataset));
    });
};
