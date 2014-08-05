/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['./caleydo', './caleydo-range', './caleydo-idtypes', './caleydo-events'], function (C, range, idtypes, events) {
  'use strict';
  function MatrixBase(root) {
    events.EventHandler.call(this);
    this.root = root;
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
    if (this instanceof MatrixView) {
      return new MatrixView(this.root, range.times(this.range, this.dim));
    } else {
      return new MatrixView(this.root, range);
    }
  }

  function Matrix(desc) {
    MatrixBase.call(this, this);
    this.desc = desc;
    this.valuetype = desc.valuetype;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.coltype = idtypes.resolve(desc.coltype);
    this.t = new TransposedMatrix(this);
  }
  Matrix.prototype = new MatrixBase;

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  Matrix.prototype.load = function() {
    var that = this;
    if (this.data) { //in the cache
      return C.resolved(this.data);
    }
    return C.getJSON(this.desc.uri).then(function(data) {
        that.data = data; //store cache
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
  Matrix.prototype.data = function(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function(data) {
      return range(data.data, that.size());
    });
  };
  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  Matrix.prototype.cols = function(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function(d) {
      return range.dim(1).filter(d.cols, that.ncol);
    });
  };
  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  Matrix.prototype.rows = function(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function(d) {
      return range.dim(0).filter(d.rows, that.nrow);
    });
  };
  Matrix.prototype.size = function() {
    return this.desc.size;
  };

  /**
   * view on the underlying matrix as transposed version
   * @param base
   * @constructor
   */
  function TransposedMatrix(base) {
    MatrixBase.call(this, this);
    this.t = base;
  }
  TransposedMatrix.prototype = new MatrixBase;
  TransposedMatrix.prototype.cols = function(range) {
    return this.t.rows(range ? range.swap(): undefined);
  };
  TransposedMatrix.prototype.rows = function(range) {
    return this.t.cols(range ? range.swap(): undefined);
  };
  TransposedMatrix.prototype.size = function() {
    var s= this.t.size();
    return [s[1],s[0]];
  };
  TransposedMatrix.prototype.at = function(i, j) {
    return this.t.at(j, i);
  };
  TransposedMatrix.prototype.data = function(range) {
    return this.t.data(range ? range.swap(): undefined);
  };

  /**
   * view on the matrix restricted by a range
   * @param root underlying matrix
   * @param range range selection
   * @param t optional its transposed version
   * @constructor
   */
  function MatrixView(root, range, t) {
    MatrixBase.call(this, root);
    this.range = range;
    this.t = t || new MatrixView(root.t, range.swap(), this);
  }
  MatrixView.prototype = new MatrixBase;
  MatrixView.prototype.cols = function() {
    return this.root.cols(this.range);
  };
  MatrixView.prototype.rows = function() {
    return this.root.rows(this.range);
  };
  MatrixView.prototype.size = function() {
    return this.range.size(this.size());
  };
  MatrixView.prototype.at = function(i, j) {
    return this.root.at(this.range.invert([i,j],this.root.size()));
  };
  MatrixView.prototype.data = function(range) {
    return this.root.data(range.times(this.range, this.root.size()));
  };

  return Matrix;
});