/**
 * Created by Samuel Gratzl on 16.07.2014.
 */

function Matrix(cols, rows, data) {
  this.cols = cols;
  this.rows = rows;
  this.data = data;
}

Matrix.prototype = {
  get nrow() {
    return this.rows.length;
  },

  get ncol() {
    return this.cols.length;
  },
  get length() {
    return this.nrow * this.ncol;
  },
  at: function (row, col) {
    return this.data[row][col];
  },
  rslice: function (start, end) {
    return new Matrix(this.cols, this.rows.slice(start, end), this.data.slice(start, end));
  },
  cslice: function (start, end) {
    return new Matrix(this.cols.slice(start, end), this.rows, this.data.map(function (row) {
      return row.slice(start, end);
    }));
  }
};

exports.create = function (conf) {
  var cols = (conf && conf.cols) || [];
  var rows = (conf && conf.rows) || [];
  var data = (conf && conf.data) || [];
  return new Matrix(cols, rows, data);
}