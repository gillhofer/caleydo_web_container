/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo','caleydo-matrix'], function (C, Matrix) {
  'use strict';
  var cache = undefined;
  function transformEntry(desc) {
    if (desc === undefined) {
      return desc;
    }
    if (desc.type === 'matrix') {
      return new Matrix(desc);
    }
    return desc;
  }
  function transform(descs) {
    var r = {};
    Object.keys(descs).forEach(function(name) {
      r[name] = transformEntry(descs[name]);
    });
    return r;
  }
  return {
    list : function() {
      if (cache) {
        return C.resolved(cache);
      }
      return C.getJSON('data/index.json').then(function(r) {
        cache = transform(r);
        return cache;
      });
    },
    get : function(name) {
      return this.list().then(function(data) {
        return data[name];
      });
    }
  };
});