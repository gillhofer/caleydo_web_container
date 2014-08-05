/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import C = require('./caleydo');
import matrix = require('./caleydo-matrix');
'use strict';

var cache = undefined;
var loader = C.getJSON('api/dataset').then(function (r) {
  cache = transform(r);
  return cache;
});
function transformEntry(desc) {
  if (desc === undefined) {
    return desc;
  }
  if (desc.type === 'matrix') {
    return new matrix.Matrix(desc);
  }
  return desc;
}
function transform(descs) {
  var r = {};
  descs.forEach(function (entry) {
    r[entry.id] = transformEntry(entry);
  });
  return r;
}

export function list() {
  return loader;
}
export function get(name) {
  return this.list().then(function (data) {
    return data[name];
  });
}