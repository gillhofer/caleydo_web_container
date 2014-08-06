/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import C = require('./caleydo');
import plugins = require('./caleydo-plugins');
import datatypes = require('./caleydo-datatype');
'use strict';

var cache = undefined;
var available = plugins.list('datatype');

var loader = C.getJSON('api/dataset').then(function (descs) {
  return C.all(descs.map((desc) => transformEntry(desc))).then((datas) => {
    var r = {};
    datas.forEach((data) => {
      r[data.desc.id] = data;
    });
    cache = r;
    return r;
  });
});
function transformEntry(desc) {
  if (desc === undefined) {
    return desc;
  }
  var plugin = available.filter((p) => p.name === desc.type);
  if (plugin.length === 0) {
    return new datatypes.DummyDataType(desc);
  }
  //take the first matching one
  return plugin[0].load().then((p) => {
    return p.factory(desc);
  });
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