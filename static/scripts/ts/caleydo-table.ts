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
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : ITable;
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
export class TableBase extends events.EventHandler {
  constructor(public _root:ITable) {
    super();
  }

  get type() {
    return 'table';
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
}

/**
 * root matrix implementation holding the data
 */
export class Table extends TableBase implements ITable {
  rowtype:idtypes.IDType;
  //data in the format col x row !!!
  private _data:any = null;
  private vectors : TableVector[];

  constructor(private desc:any) {
    super(null);
    this._root = this;
    this.rowtype = idtypes.resolve(desc.rowtype);
    this.vectors = desc.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
  }

  get name() {
    return this.desc.name;
  }

  get id() {
    return this.desc.id;
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
    return C.getJSON(this.desc.uri).then(function (data) {
      that._data = data; //store cache
      //transpose to have column order for better vector access
      that._data.data = datatypes.transpose(data.data);
      that.fire("loaded", this);
      return data;
    });
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
      return datatypes.transpose(range.swap().filter(data.data, this.swap(that.size())));
    });
  }

  private swap(d : number[]) {
    return d.slice(0).reverse();
  }

  size() {
    return this.desc.size;
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

  get name() {
    return this._root.name;
  }

  get id() {
    return this._root.id;
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

  view(range:ranges.Range = ranges.all()) {
    return new TableView(this._root, this.range.preMultiply(range, this.dim));
  }

  get rowtype() {
    return this._root.rowtype;
  }
}

/**
 * root matrix implementation holding the data
 */
export class TableVector extends vector.VectorBase implements vector.IVector {
  valuetype:any;
  idtype:idtypes.IDType = null;

  constructor(private table: Table, private index: number, private desc:any) {
    super(null);
    this._root = this;
    this.valuetype = desc.value;
  }

  get name() {
    return this.desc.name;
  }

  get id() {
    return this.index.toString();
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

  ids(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.rows, that.dim);
    });
  }

  size() {
    return this.table.nrow;
  }
}