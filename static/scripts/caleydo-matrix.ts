/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./caleydo');
import ranges = require('./caleydo-range');
import idtypes = require('./caleydo-idtypes');
import datatypes = require('./caleydo-datatype');
import events = require('./caleydo-events');
import vector = require('./caleydo-vector');

export interface IMatrix extends datatypes.IDataType {
  /**
   * nrow * ncol
   */
  length : number;
  /**
   * number of rows
   */
  nrow: number;
  /**
   * number of cols
   */
  ncol : number;
  /**
   * type of the value - to be specified
   */
  valuetype:any;
  /**
   * row id type
   */
  rowtype:idtypes.IDType;
  /**
   * column id type
   */
  coltype:idtypes.IDType;

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : IMatrix;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param this_f the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector
  /**
   * transposed version of this matrix
   */
  t : IMatrix;
  /**
   * returns a promise for getting the col names of the matrix
   * @param range
   * @returns {IPromise<string[]>}
   */
  cols(range?:ranges.Range) : C.IPromise<string[]>;
  /**
   * returns a promise for getting the row names of the matrix
   * @param range
   */
  rows(range?:ranges.Range) : C.IPromise<string[]>;
  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number, j:number) : C.IPromise<any>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : C.IPromise<any[][]>;
}

/**
 * base class for different Matrix implementations, views, transposed,...
 */
export class MatrixBase extends events.EventHandler {
  constructor(public _root:IMatrix) {
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

  view(range:ranges.Range = ranges.all()) : IMatrix {
    return new MatrixView(this._root, range);
  }

  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector {
    return new ProjectedVector(<IMatrix>(<any>this), f, this_f, valuetype, idtype);
  }
}

/**
 * root matrix implementation holding the data
 */
export class Matrix extends MatrixBase implements IMatrix {
  t:IMatrix;
  valuetype:any;
  rowtype:idtypes.IDType;
  coltype:idtypes.IDType;
  private _data : any = null;

  constructor(public desc: datatypes.IDataDescription) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.valuetype = d.value;
    this.rowtype = idtypes.resolve(d.rowtype);
    this.coltype = idtypes.resolve(d.coltype);
    this.t = new TransposedMatrix(this);
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() {
    var that = this;
    if (this._data) { //in the cache
      return C.resolved(this._data);
    }
    return C.getJSON((<any>this.desc).uri).then(function (data) {
      that._data = data; //store cache
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

  data(range: ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.data, that.size());
    });
  }

  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range: ranges.Range= ranges.all()) : C.IPromise<string[]>{
    var that = this;
    return this.load().then(function (d : any) {
      return range.dim(1).filter(d.cols, that.ncol);
    });
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: ranges.Range = ranges.all()) : C.IPromise<string[]>{
    var that = this;
    return this.load().then(function (d : any) {
      return range.dim(0).filter(d.rows, that.nrow);
    });
  }

  size() {
    return (<any>this.desc).size;
  }
}

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
class TransposedMatrix extends MatrixBase  implements IMatrix{
  t:IMatrix;

  constructor(base:Matrix) {
    super(base);
    this.t = base;
  }

  get desc() {
    return this._root.desc;
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.coltype;
  }

  get coltype() {
    return this._root.rowtype;
  }

  cols(range:ranges.Range = ranges.all()): C.IPromise<string[]> {
    return this.t.rows(range ? range.swap() : undefined);
  }

  rows(range:ranges.Range = ranges.all()): C.IPromise<string[]> {
    return this.t.cols(range ? range.swap() : undefined);
  }

  size() {
    var s = this.t.dim;
    return [s[1], s[0]]; //swap dimension
  }

  at(i:number, j:number) {
    return this.t.at(j, i);
  }

  data(range:ranges.Range = ranges.all()) {
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
  constructor(root:IMatrix, private range:ranges.Range, public t? : IMatrix) {
    super(root);
    this.range = range;
    if (!t) {
      this.t = new MatrixView(root.t, range.swap(), this);
    }
  }

  get desc() {
    return this._root.desc;
  }

  cols(range: ranges.Range = ranges.all()) {
    return this._root.cols(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: ranges.Range = ranges.all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i: number, j : number) {
    var inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0], inverted[1]);
  }

  data(range: ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim)).then((data : any[][]) => datatypes.transpose(data));
  }

  view(range: ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new MatrixView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.rowtype;
  }

  get coltype() {
    return this._root.coltype;
  }
}

/**
 * a simple projection of a matrix columns to a vector
 */
class ProjectedVector extends vector.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;

  constructor(private m : IMatrix, private f : (row : any[]) => any, private this_f = m, public valuetype = m.valuetype, public idtype = m.rowtype) {
    super(null);
    this.desc = {
      name : m.desc.name+'-p',
      type : 'vector',
      id : m.desc.id+'-p'
    };
    this._root = this;
  }

  size() {
    return this.m.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  ids(range?:ranges.Range) : C.IPromise<string[]> {
    return this.m.rows(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : C.IPromise<any> {
    return this.m.data(ranges.list(i)).then((d)=> {
      return this.f.call(this.this_f, d[0]);
    });
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : C.IPromise<any[]> {
    return this.m.data(range).then((d)=> {
      return d.map(this.f, this.this_f);
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
export function create(desc: datatypes.IDataDescription): IMatrix {
  return new Matrix(desc);
}