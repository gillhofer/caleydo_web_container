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
  row: function(i) {
    return this.data[i];
  },
  col: function(j) {
    return this.data.map(function(row) { return row[j]; });
  },
  rslice: function (start, end) {
    return new Matrix(this.cols, this.rows.slice(start, end), this.data.slice(start, end));
  },
  cslice: function (start, end) {
    return new Matrix(this.cols.slice(start, end), this.rows, this.data.map(function (row) {
      return row.slice(start, end);
    }));
  },
  slice: function (rstart, rend, cstart, cend) {
    return new Matrix(this.cols.slice(cstart, cend), this.rows.slice(rstart, rend), this.data.slice(rstart, rend).map(function (row) {
      return row.slice(cstart, cend);
    }));
  },
  map : function (f) {
    var d = this.data.map(function(row) {
      return row.map(f);
    });
    return new Matrix(this.cols, this.rows, d);
  },
  toString : function(colSep, rowSep) {
    colSep = colSep || ",";
    rowSep = rowSep || "\n";
    return this.data.map(function(row) { return row.join(colSep)}).join(rowSep);
  }
};

exports.create = function (conf) {
  var cols = (conf && conf.cols) || [];
  var rows = (conf && conf.rows) || [];
  var data = (conf && conf.data) || [];
  return new Matrix(cols, rows, data);
}