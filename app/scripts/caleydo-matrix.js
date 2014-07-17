/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo', 'caleydo-range', 'caleydo-idtypes'], function (C, range, idtypes) {
  function Matrix(desc) {
    this.desc = desc;
    this.size = desc.size;
    this.valuetype = desc.valuetype;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.coltype = idtypes.resolve(desc.coltype);
  }
  Matrix.prototype.load = function(resolve, reject) {
    var that = this;
    if (this.data) {
      resolve(this.data);
    } else {
      C.getJSON(this.desc.uri).then(function(data) {
        that.data;
        resolve(data);
      }, function(error) {
        reject(error);
      });
    }
  };
  Matrix.prototype.at = function(i,j) {
    return C.promised(this.load).then(function(d) {
      return d.data[i][j];
    });
  };
  Matrix.prototype.map = function(f) {
    return C.promised(this.load).then(function(d) {
      return d.data[i][j];
    });
  };
  Matrix.prototype.cols = function() {
    return C.promised(this.load).then(function(d) {
      return d.cols;
    });
  };
  Matrix.prototype.rows = function() {
    return C.promised(this.load).then(function(d) {
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