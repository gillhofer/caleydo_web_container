/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./caleydo');
import ranges = require('./caleydo-range');
import idtypes = require('./caleydo-idtypes');
import datatypes = require('./caleydo-datatype');
import events = require('./caleydo-events');
import math = require('./caleydo-math');

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
  ids(range?:ranges.Range) : C.IPromise<ranges.Range>;
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
}


/**
 * base class for different Vector implementations, views, transposed,...
 */
export class VectorBase extends events.EventHandler {
  private _numSelectListeners = 0;
  private _selectionListener = (event: any, act: ranges.Range, added: ranges.Range, removed: ranges.Range) => {
    this.ids().then((ids: ranges.Range) => {
      //filter to the right ids and convert to indices format
      act = ids.indexRangeOf(act);
      added = ids.indexRangeOf(added);
      removed = ids.indexRangeOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      this.fire('select',[act, added, removed]);
    })
  };

  constructor(public _root:IVector) {
    super();
  }

  ids(range?:ranges.Range) : C.IPromise<ranges.Range> {
    throw new Error('not implemented');
  }

  get idtype() : idtypes.IDType {
    throw new Error('not implemented');
  }

  on(events, handler) {
    if (events === 'select') {
      this._numSelectListeners ++;
      if (this._numSelectListeners === 1) {
        this.idtype.on('select', this._selectionListener);
      }
    }
    return super.on(events, handler);
  }

  off(events, handler) {
    if (events === 'select') {
      this._numSelectListeners --;
      if (this._numSelectListeners === 0) {
        this.idtype.off('select', this._selectionListener);
      }
    }
    return super.off(events, handler);
  }

  selections(type = idtypes.defaultSelectionType) {
    return this.ids().then((ids: ranges.Range) => {
      var r = this.idtype.selections(type);
      return ids.indexRangeOf(r);
    });
  }

  select(range: ranges.Range);
  select(range: ranges.Range, op : idtypes.SelectOperation);
  select(range: number[]);
  select(range: number[], op : idtypes.SelectOperation);
  select(type: string, range: ranges.Range);
  select(type: string, range: ranges.Range, op : idtypes.SelectOperation);
  select(type: string, range: number[]);
  select(type: string, range: number[], op : idtypes.SelectOperation);
  select(r_or_t : any, r_or_op ?: any, op = idtypes.SelectOperation.SET) {
    function asRange(v:any) {
      if (C.isArray(v)) {
        return ranges.list(v);
      }
      return v;
    }

    var type = (typeof r_or_t === 'string') ? r_or_t.toString() : idtypes.defaultSelectionType;
    var range = asRange((typeof r_or_t === 'string') ? r_or_op : r_or_t);
    op = (typeof r_or_t === 'string') ? op : (r_or_op ? r_or_op : idtypes.SelectOperation.SET);
    return this.selectImpl(range, op, type);
  }

  private selectImpl(range: ranges.Range, op = idtypes.SelectOperation.SET, type : string = idtypes.defaultSelectionType) {
    return this.ids().then((ids: ranges.Range) => {
      range = ids.preMultiply(range);
      var r = this.idtype.select(type, range, op);
      return ids.indexRangeOf(r);
    });
  }

  clear(type = idtypes.defaultSelectionType) {
    return this.selectImpl(ranges.none(), idtypes.SelectOperation.SET, type);
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
    return C.getJSON((<any>this.desc).uri).then(function (data) {
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
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: datatypes.IDataDescription): IVector {
  return new Vector(desc);
}