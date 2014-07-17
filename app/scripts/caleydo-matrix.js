/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo', 'caleydo-range', 'caleydo-idtypes', 'caleydo-events'], function (C, range, idtypes, events) {
  'use strict';
  function MatrixBase() {
    events.EventHandler.call(this);
  }
  MatrixBase.prototype = new events.EventHandler;
  Object.defineProperties(MatrixBase.prototype, {
    /**
     * returns the length = rows * cols
     */
    length: {
      enumerable: true,
      get: function () {
        return this.nrow * this.ncol;
      }
    },
    /**
     * return the number of rows
     */
    nrow: {
      enumerable: true,
      get: function () {
        return this.dim[0];
      }
    },
    /**
     * return the number of columns
     */
    ncol: {
      enumerable: true,
      get: function () {
        return this.dim[1];
      }
    },
    /**
     * return [rows, dims]
     */
    dim: {
      enumerable: true,
      get: function () {
        return this.size();
      }
    }
  });
  MatrixBase.prototype.view = function(range) {
    return new MatrixView(this.root, range.times(this.range, this.dim));
  }

  function Matrix(desc) {
    MatrixBase.call(this, range.all());
    this.root = this;
    this.desc = desc;
    this.valuetype = desc.valuetype;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.coltype = idtypes.resolve(desc.coltype);
    this.t = new TransposedMatrix(this);
  }
  Matrix.prototype = new MatrixBase;

  /**
   * loads all the underlying data in json format
   * @returns {*}
   */
  Matrix.prototype.load = function() {
    var that = this;
    if (this.data) { //in the cache
      return C.resolved(this.data);
    }
    return C.getJSON(this.desc.uri).then(function(data) {
        that.data; //store cache
        that.fire("loaded", this);
        return data;
    });
  };
  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  Matrix.prototype.at = function(i,j) {
    return this.load().then(function(d) {
      return d.data[i][j];
    });
  };
  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  Matrix.prototype.cols = function() {
    return this.load().then(function(d) {
      return d.cols;
    });
  };
  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  Matrix.prototype.rows = function() {
    return this.load().then(function(d) {
      return d.rows;
    });
  };
  Matrix.prototype.size = function() {
    return this.desc.size;
  };

  /**
   * view on the underlying matrix as the transposed version
   * @param base
   * @constructor
   */
  function TransposedMatrix(base) {
    MatrixBase.call(this);
    this.root = this;
    this.t = base;
  }
  TransposedMatrix.prototype = new MatrixBase;
  TransposedMatrix.prototype.cols = function() {
    return this.t.rows();
  };
  TransposedMatrix.prototype.rows = function() {
    return this.t.cols();
  };
  TransposedMatrix.prototype.size = function() {
    var s= this.t.size();
    return [s[1],s[0]];
  };
  TransposedMatrix.prototype.at = function(i, j) {
    return this.t.at(j, i);
  };
  return Matrix;
});