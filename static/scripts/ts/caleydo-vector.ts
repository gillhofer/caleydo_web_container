/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./caleydo');
import ranges = require('./caleydo-range');
import idtypes = require('./caleydo-idtypes');
import events = require('./caleydo-events');

export interface IVector extends events.EventHandler {
  dim: number[];
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
}

/**
 * base class for different Vector implementations, views, transposed,...
 */
export class VectorBase extends events.EventHandler {
  constructor(public _root:IVector) {
    super();
  }

  get dim() {
    return [this.length];
  }

  size():number {
    throw new Error('not implemented');
  }

  get length() {
    return this.size();
  }

  view(range:ranges.Range = ranges.all()) : IVector {
    return new VectorView(this._root, range);
  }
}

/**
 * root matrix implementation holding the data
 */
export class Vector extends VectorBase implements IVector {
  valuetype:any;
  idtype:idtypes.IDType;
  private _data : any[] = null;

  constructor(private desc:any) {
    super(null);
    this._root = this;
    this.valuetype = desc.valuetype;
    this.idtype = idtypes.resolve(desc.idtype);
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

  data(range: ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.data, that.dim);
    });
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
class VectorView extends VectorBase  implements IVector{
  constructor(root:IVector, private range:ranges.Range) {
    super(root);
    this.range = range;
  }

  size() {
    return this.range.size(this._root.dim)[0];
  }

  at(i: number) {
    var inverted = this.range.invert([i], this._root.dim);
    return this._root.at(inverted[0]);
  }

  data(range: ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  view(range: ranges.Range = ranges.all()) {
    return new VectorView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get idtype() {
    return this._root.idtype;
  }
}