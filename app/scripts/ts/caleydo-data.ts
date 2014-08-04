/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import C = require('caleydo');
import matrix = require('caleydo-matrix');
'use strict';

var cache = undefined;
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
  Object.keys(descs).forEach(function (name) {
    r[name] = transformEntry(descs[name]);
  });
  return r;
}

export function list() {
  if (cache) {
    return C.resolved(cache);
  }
  return C.getJSON('data/index.json').then(function (r) {
    cache = transform(r);
    return cache;
  });
}
export function get(name) {
  return this.list().then(function (data) {
    return data[name];
  });
}