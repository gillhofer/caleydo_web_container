/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
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

  /**
   * Sorts an array.
   * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): C.IPromise<IVector>;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  every(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<boolean>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  some(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<boolean>;

  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(callbackfn: (value: any, index: number) => void, thisArg?: any): void;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): C.IPromise<IVector>;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<IVector>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  reduce<T>(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue?: T, thisArg?: any): C.IPromise<T>;
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  reduce<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): C.IPromise<U>;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  reduceRight<T>(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue?: T, thisArg?: any): C.IPromise<T>;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  reduceRight<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): C.IPromise<U>;


  /**
   * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
   */
  groups(): C.IPromise<ranges.CompositeRange1D>;
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

  idView(idRange:ranges.Range = ranges.all()) : C.IPromise<IVector> {
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  stats() : C.IPromise<math.IStatistics> {
    return this.data().then((d) => math.computeStats(d));
  }

  get indices() : ranges.Range {
    return ranges.range(0, this.length);
  }

  /**
   * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
   */
  groups(): C.IPromise<ranges.CompositeRange1D> {
    var v = this._root.valuetype;
    if (v.type === 'categorical') {
      return this.data().then((d) => {
        var options: any = {
          name: this._root.desc.id
        };
        if (v.categories[0].color) {
          options.colors = v.categories.map((d) => d.color);
        }
        return datatypes.categorical2partitioning(d, v.categories.map((d) => typeof d === 'string' ? d : d.name), options);
      });
    } else {
      return C.resolved(ranges.composite(this._root.desc.id, [ ranges.asUngrouped(this.indices.dim(0))]));
    }
  }

  hist(bins? : number) : C.IPromise<math.IHistogram> {
    var v = this._root.valuetype;
    return this.data().then((d) => {
      switch(v.type) {
      case 'categorical':
          return math.categoricalHist(d, this.indices.dim(0), d.length, v.categories.map((d) => typeof d === 'string' ? d : d.name));
      case 'real':
      case 'int':
        return math.hist(d, this.indices.dim(0), d.length, bins ? bins : Math.round(Math.sqrt(this.length)), v.range);
      default:
          return null; //cant create hist for unique objects or other ones
      }
    });
  }

  every(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<boolean> {
    return this.data().then((d) => d.every(callbackfn, thisArg));
  }

  some(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<boolean> {
    return this.data().then((d) => d.some(callbackfn, thisArg));
  }

  forEach(callbackfn: (value: any, index: number) => void, thisArg?: any): void {
    this.data().then((d) => d.forEach(callbackfn, thisArg));
  }

  reduce<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): C.IPromise<U> {
    function helper() {
      return callbackfn.apply(thisArg, C.argList(arguments));
    }
    return this.data().then((d) => d.reduce(helper, initialValue));
  }

  reduceRight<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): C.IPromise<U> {
    function helper() {
      return callbackfn.apply(thisArg, C.argList(arguments));
    }
    return this.data().then((d) => d.reduceRight(helper, initialValue));
  }

  restore(persisted: any) {
    var r : IVector = <IVector>(<any>this);
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }
}

export interface IVectorLoader {
  (desc: datatypes.IDataDescription) : C.IPromise<{
    rowIds : ranges.Range;
    rows : string[];
    data : any[];
  }>
}


function viaAPILoader() {
  var _loader = undefined;
  return (desc) => {
    if (_loader) { //in the cache
      return _loader;
    }
    return _loader = C.getAPIJSON('/dataset/'+desc.id).then(function (data) {
      data.rowIds = ranges.list(data.rowIds);
      return data;
    });
  };
}

function viaDataLoader(rows: string[], rowIds: number[], data: any[]) {
  var _data = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return C.resolved(_data);
    }
    _data = {
      rowIds : ranges.list(rowIds),
      rows: rows,
      data: data
    };
    return C.resolved(_data);
  };
}

/**
 * root matrix implementation holding the data
 */
export class Vector extends VectorBase implements IVector {
  valuetype:any;
  _idtype:idtypes.IDType;

  constructor(public desc:datatypes.IDataDescription, private loader : IVectorLoader) {
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
  load() : C.IPromise<any> {
    return this.loader(this.desc);
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

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): C.IPromise<IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): C.IPromise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  persist() {
    return this.desc.id;
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
  }

  get desc() {
    return this._root.desc;
  }

  persist() {
    return {
      root: this._root.persist(),
      range: this.range.toString()
    };
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

  /*get indices() {
    return this.range;
  }*/

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): C.IPromise<IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(this.range.preMultiply(ranges.list(indices)));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): C.IPromise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): C.IPromise<IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(this.range.preMultiply(ranges.list(indices)));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: datatypes.IDataDescription): IVector {
  return new Vector(desc, viaAPILoader());
}

export function wrap(desc: datatypes.IDataDescription, rows: string[], rowIds: number[], data: any[]) {
  return new Vector(desc, viaDataLoader(rows, rowIds, data));
}
