/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('caleydo');
import range = require('caleydo-range');
import idtypes = require('caleydo-idtypes');
import events = require('caleydo-events');

export interface IMatrix extends events.EventHandler {
  dim: number[];
  length : number;
  nrow: number;
  ncol : number;
  view(range:range.Range) : IMatrix;
  t : IMatrix;
  cols() : C.IPromise<string[]>;
  rows() : C.IPromise<string[]>;
  at(i:number, j:number) : C.IPromise<any>;
  data(range:range.Range) : C.IPromise<any[][]>;
}

export class MatrixBase extends events.EventHandler {
  constructor(public _root:Matrix) {
    super();
  }

  size():number[] {
    throw new Error('not implemented');
  }

  get dim() {
    return this.size();
  }

  get length() {
    return this.nrow * this.ncol;
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  view(range:range.Range) : IMatrix {
    return new MatrixView(this._root, range);
  }
}

export class Matrix extends MatrixBase implements IMatrix {
  public t:IMatrix;
  public valuetype:any;
  public rowtype:idtypes.IDType;
  public coltype:idtypes.IDType;

  constructor(private desc:any) {
    super(null);
    this._root = this;
    this.valuetype = desc.valuetype;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.coltype = idtypes.resolve(desc.coltype);
    this.t = new TransposedMatrix(this);
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() {
    var that = this;
    if (this.data) { //in the cache
      return C.resolved(this.data);
    }
    return C.getJSON(this.desc.uri).then(function (data) {
      that.data = data; //store cache
      that.fire("loaded", this);
      return data;
    });
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.load().then(function (d) {
      return d.data[i][j];
    });
  }

  data(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function (data) {
      return range(data.data, that.size());
    });
  }

  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function (d) {
      return range.dim(1).filter(d.cols, that.ncol);
    });
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range) {
    range = range || range.all();
    var that = this;
    return this.load().then(function (d) {
      return range.dim(0).filter(d.rows, that.nrow);
    });
  }

  size() {
    return this.desc.size;
  }
}

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
class TransposedMatrix extends MatrixBase  implements IMatrix{
  public t:IMatrix;

  constructor(base:Matrix) {
    super(base);
    this.t = base;
  }

  cols(range:range.Range) {
    return this.t.rows(range ? range.swap() : undefined);
  }

  rows(range:range.Range) {
    return this.t.cols(range ? range.swap() : undefined);
  }

  size() {
    var s = this.t.dim;
    return [s[1], s[0]];
  }

  at(i:number, j:number) {
    return this.t.at(j, i);
  }

  data(range:range.Range) {
    return this.t.data(range ? range.swap() : undefined);
  }
}

/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class MatrixView extends MatrixBase  implements IMatrix{
  constructor(root:Matrix, private range:range.Range, public t = new MatrixView(root.t, range.swap(), this)) {
    super(root);
    this.range = range;
  }

  cols() {
    return this._root.cols(this.range);
  }

  rows() {
    return this._root.rows(this.range);
  }

  size() {
    return this.range.size(this.size());
  }

  at(i: number, j : number) {
    var inverted = this.range.invert([i, j], this._root.size());
    return this._root.at(inverted[0], inverted[1]);
  }

  data(range: range.Range) {
    return this._root.data(range.times(this.range, this._root.size()));
  }

  view(range: range.Range) {
    return new MatrixView(this._root, range.times(this.range, this.dim));
  }
}