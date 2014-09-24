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

export interface ITable extends datatypes.IDataType {
  ncol : number;
  nrow : number;

  /**
   * id type
   */
  rowtype:idtypes.IDType;

  cols(range?:ranges.Range) : vector.IVector[];

  col(i:number) : vector.IVector;
  /**
   * returns a promise for getting the row names of the matrix
   * @param range
   */
  rows(range?:ranges.Range) : C.IPromise<string[]>;
  rowIds(range?:ranges.Range) : C.IPromise<ranges.Range>

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : ITable;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param this_f the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector
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
 * base class for different Table implementations, views, transposed,...
 */
export class TableBase extends idtypes.SelectAble {
  constructor(public _root:ITable) {
    super();
  }

  get dim() {
    return this.size();
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  size():number[] {
    throw new Error('not implemented');
  }

  view(range:ranges.Range = ranges.all()):ITable {
    return new TableView(this._root, range);
  }

  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector {
    return new MultiTableVector(<ITable>(<any>this), f, this_f, valuetype, idtype);
  }
}

/**
 * root matrix implementation holding the data
 */
export class Table extends TableBase implements ITable {
  rowtype:idtypes.IDType;
  //data in the format col x row !!!
  private _data:any = null;
  private vectors : TableVector[];

  constructor(public desc:datatypes.IDataDescription) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.rowtype = idtypes.resolve(d.rowtype);
    this.vectors = d.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
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
    return C.getJSON(C.server_url+'/dataset/'+this.desc.id).then(function (data) {
      data.rowIds = ranges.list(data.rowIds);
      that._data = data; //store cache
      //transpose to have column order for better vector access
      that._data.data = datatypes.transpose(data.data);
      that.fire("loaded", this);
      return data;
    });
  }

  get idtypes() {
    return [this.rowtype];
  }

  col(i: number) {
    return this.vectors[i];
  }

  cols(range:ranges.Range = ranges.all()) {
    return range.filter(this.vectors, [this.ncol]);
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.load().then(function (d) {
      return d.data[j][i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return datatypes.transpose(range.swap().filter(data.data, that.swap(that.size())));
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
  rowIds(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.rowIds, that.dim);
    });
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.rowIds(range);
  }

  private swap(d : number[]) {
    return d.slice(0).reverse();
  }

  size() {
    return (<any>this.desc).size;
  }
}

/**
 * view on the vector restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class TableView extends TableBase implements ITable {
  constructor(root:ITable, private range:ranges.Range) {
    super(root);
    this.range = range;
  }

  get desc() {
    return this._root.desc;
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i:number, j:number) {
    var inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0],inverted[1]);
  }

  col(i: number) {
    var inverted = this.range.invert([0,i], this._root.dim);
    return this._root.col(inverted[1]);
  }

  cols(range:ranges.Range = ranges.all()) {
    return this._root.cols(this.range.swap().preMultiply(range, this._root.dim));
  }

  data(range:ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: ranges.Range = ranges.all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }
  rowIds(range:ranges.Range = ranges.all()) {
    return this._root.rowIds(this.range.preMultiply(range, this._root.dim));
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.rowIds(range);
  }

  view(range:ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new TableView(this._root, this.range.preMultiply(range, this.dim));
  }

  get rowtype() {
    return this._root.rowtype;
  }

  get idtypes() {
    return [this.rowtype];
  }
}

/**
 * root matrix implementation holding the data
 */
export class TableVector extends vector.VectorBase implements vector.IVector {
  valuetype:any;

  constructor(private table: Table, private index: number, public desc:datatypes.IDataDescription) {
    super(null);
    this._root = this;
    this.valuetype = (<any>desc).value;
  }

  get idtype() {
    return this.table.rowtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() {
    var that = this;
    return this.table.load().then(function (data) {
      return data.data[that.index];
    });
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i) {
    return this.load().then(function (d) {
      return d.data[i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.data, that.dim);
    });
  }

  names(range:ranges.Range = ranges.all()) {
    return this.table.rows(range);
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.table.rowIds(range);
  }

  size() {
    return this.table.nrow;
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class MultiTableVector extends vector.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;

  constructor(private table : ITable, private f : (row : any[]) => any, private this_f = table, public valuetype = null, private _idtype = table.rowtype) {
    super(null);
    this.desc = {
      name : table.desc.name+'-p',
      type : 'vector',
      id : table.desc.id+'-p'
    };
    this._root = this;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.table.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : C.IPromise<string[]> {
    return this.table.rows(range);
  }
  ids(range?:ranges.Range) {
    return this.table.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : C.IPromise<any> {
    return this.table.data(ranges.list(i)).then((d)=> {
      return this.f.call(this.this_f, d[0]);
    });
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : C.IPromise<any[]> {
    return this.table.data(range).then((d)=> {
      return d.map(this.f, this.this_f);
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {ITable}
 */
export function create(desc: datatypes.IDataDescription): ITable {
  return new Table(desc);
}