/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import events = require('./event');
import math = require('./math');

export interface IVector extends datatypes.IDataType {
  /**
   * length of the vector
   */
  length : number;
  /**
   * type of the value - to be specified
   */
  valuetype:any;
  /**
   * id type
   */
  idtype:idtypes.IDType;

  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : C.IPromise<string[]>;
  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : IVector;
  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : C.IPromise<any>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : C.IPromise<any[]>;

  stats() : C.IPromise<math.IStatistics>;

  hist(bins? : number) : C.IPromise<math.IHistogram>;
}


/**
 * base class for different Vector implementations, views, transposed,...
 */
export class VectorBase extends idtypes.SelectAble {
  constructor(public _root:IVector) {
    super();
  }

  get dim() {
    return [this.length];
  }

  data() : C.IPromise<any[]> {
    throw new Error('not implemented');
  }

  size():number {
    throw new Error('not implemented');
  }

  get length() {
    return this.size();
  }

  view(range:ranges.Range = ranges.all()):IVector {
    return new VectorView(this._root, range);
  }

  stats() : C.IPromise<math.IStatistics> {
    return this.data().then((d) => math.computeStats(d));
  }
}

/**
 * root matrix implementation holding the data
 */
export class Vector extends VectorBase implements IVector {
  valuetype:any;
  _idtype:idtypes.IDType;
  private _data:any = null;

  constructor(public desc:datatypes.IDataDescription) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.valuetype = d.value;
    this._idtype = idtypes.resolve(d.idtype);
  }

  get idtype() {
    return this._idtype;
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
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.rows, that.dim);
    });
  }
  ids(range:ranges.Range = ranges.all()): C.IPromise<ranges.Range> {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.rowIds, that.dim);
    });
  }

  get idtypes() {
    return [this.idtype];
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
class VectorView extends VectorBase implements IVector {
  constructor(root:IVector, private range:ranges.Range) {
    super(root);
    this.range = range;
  }

  get desc() {
    return this._root.desc;
  }

  size() {
    return this.range.size(this._root.dim)[0];
  }

  at(i:number) {
    var inverted = this.range.invert([i], this._root.dim);
    return this._root.at(inverted[0]);
  }

  data(range:ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  names(range:ranges.Range = ranges.all()) {
    return this._root.names(this.range.preMultiply(range, this._root.dim));
  }
  ids(range:ranges.Range = ranges.all()) {
    return this._root.ids(this.range.preMultiply(range, this._root.dim));
  }

  view(range:ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new VectorView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get idtype() {
    return this._root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: datatypes.IDataDescription): IVector {
  return new Vector(desc);
}