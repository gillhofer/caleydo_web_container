/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo', 'caleydo-range', 'caleydo-idtypes'], function (C, range, idtypes) {
  'use strict';
  function Matrix(desc) {
    this.desc = desc;
    this.size = desc.size;
    this.valuetype = desc.valuetype;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.coltype = idtypes.resolve(desc.coltype);
  }
  Matrix.prototype.load = function() {
    var that = this;
    if (this.data) {
      return C.resolved(this.data);
    }
    return C.getJSON(this.desc.uri).then(function(data) {
        that.data;
        return data;
    });
  };
  Matrix.prototype.at = function(i,j) {
    return this.load().then(function(d) {
      return d.data[i][j];
    });
  };
  Matrix.prototype.map = function(f) {
    return this.load().then(function(d) {
      return d.data[i][j];
    });
  };
  Matrix.prototype.cols = function() {
    return this.load().then(function(d) {
      return d.cols;
    });
  };
  Matrix.prototype.rows = function() {
    return this.load().then(function(d) {
      return d.rows;
    });
  };

  Object.defineProperties(Matrix.prototype, {
    length: {
      enumerable: true,
      get: function () {
        return this.nrow * this.ncol;
      }
    },
    nrow: {
      enumerable: true,
      get: function () {
        return this.size[0];
      }
    },
    ncol: {
      enumerable: true,
      get: function () {
        return this.size[1];
      }
    },
    dim: {
      enumerable: true,
      get: function () {
        return this.size;
      }
    }
  });
  return Matrix;
});