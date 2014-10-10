/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./caleydo');
import Iterator = require('./caleydo-iterator');
'use strict';

export class RangeElem {
  constructor(public from :number, public to = -1, public step = 1) {
    if (step !== 1 && step !== -1) {
      throw new Error("currently just +1 and -1 are valid steps");
    }
  }

  get isAll() {
    return this.from === 0 && this.to === -1 && this.step === 1;
  }

  get isSingle() {
    return (this.from + this.step) === this.to
  }

  static all() {
    return new RangeElem(0,-1,1);
  }
  static none() {
    return new RangeElem(0,0,1);
  }
  static single(val: number) {
    return new RangeElem(val, val+1,1);
  }
  static range(from :number, to = -1, step = 1) {
    return new RangeElem(from, to, step);
  }

  size(size : number) : number {
    var t = this.fix(this.to, size), f = this.fix(this.from, size);
    if (this.step === 1) {
      return Math.max(t - f,0);
    } else if (this.step === -1){
      return Math.max(f - t,0);
    }
    var d = this.step > 0 ? (t - f+1) : (f - t+1);
    var s = Math.abs(this.step);
    if (d <= 0) { //no range
      return 0;
    }
    return Math.floor(d/s);
  }

  clone() {
    return new RangeElem(this.from, this.to, this.step);
  }

  /**
   * fix negative indices given the total size
   * @param v
   * @param size
   * @returns {number}
   */
  private fix(v:number, size:number) {
    return v < 0 ? (size + 1 - v) : v;
  }

  invert(index: number, size? : number) {
    if (this.isAll) {
      return index;
    }
    return this.fix(this.from, size) + index * this.step;
  }
  /**
   * creates an iterator of this range
  * @param size the underlying size for negative indices
  */
  iter(size?: number):Iterator.IIterator<number> {
    return Iterator.range(this.fix(this.from, size), this.fix(this.to, size), this.step);
  }

  toString() {
    if (this.isAll) {
      return '';
    }
    if (this.isSingle) {
      return this.from.toString();
    }
    var r = this.from + ':' + this.to;
    if (this.step !== 1) {
      r += ':' + this.step;
    }
    return r;
  }

  static parse(code: string) {
    if (code.length === 0) {
      return RangeElem.all();
    }
    var parts = code.split(':');
    if(parts.length === 1) {
      return RangeElem.single(parseInt(parts[0]));
    } else if (parts.length === 2) {
      return new RangeElem(parseInt(parts[0]),parseInt(parts[1]));
    }
    return new RangeElem(parseInt(parts[0]),parseInt(parts[1]),parseInt(parts[2]));
  }
}

export class Range1D {
  private arr = new Array<RangeElem>();

  constructor(arr : RangeElem[] = []) {
    this.arr = arr;
  }

  get length() {
    return this.arr.length;
  }

  static all() {
    return new Range1D([RangeElem.all()]);
  }
  static none() {
    return new Range1D();
  }

  static from(indices : number[]) {
    return new Range1D(Range1D.compress(indices));
  }

  private static compress(indices: number[]) {
    if (indices.length === 0) {
      return [];
    } else if (indices.length === 1) {
      return [RangeElem.single(indices[0])];
    }
    //return indices.map(RangeElem.single);
    var r = new Array<RangeElem>(),
      deltas = indices.slice(1).map((e,i) => e-indices[i]),
      start = 0, act = 1, i = 0;
    while(act < indices.length) {
      while(deltas[start] == deltas[act-1] && act < indices.length) {
        act++;
      }
      if (act === start+1) {
        r.push(RangeElem.single(indices[start]));
      } else {
        //+1 since end is excluded
        //fix while just +1 -1 is allowed
        if (Math.abs(deltas[start]) === 1) {
          r.push(RangeElem.range(indices[start], indices[act - 1] + 1, deltas[start]));
        } else {
          for(i = start; i < act; i++) {
            r.push(RangeElem.single(indices[i]));
          }
        }
      }
      start = act-1;
    }
    return r;
  }

  get isAll() {
    return this.length === 1 && this.at(0).isAll;
  }
  get isNone() {
    return this.length === 0;
  }

  private get isList() {
    return this.arr.every((d) => d.isSingle);
  }

  push(...items: string[]): number;
  push(...items: RangeElem[]): number;
  push(...items: any[]): number {
    function p(item : any) {
      if  (typeof item === 'string') {
        return RangeElem.parse(item.toString());
      } else if (typeof item === 'number') {
        return RangeElem.single(<number>item);
      } else if (C.isArray(item)) {
        return new RangeElem(item[0],item[1],item[2]);
      }
      return <RangeElem>item;
    }
    return this.arr.push.apply(this.arr,items.map(p));
  }

  pushSlice(from: number, to: number = -1, step : number = 1) {
    this.arr.push(new RangeElem(from, to, step));
  }
  pushList(indices : number[]) {
    this.arr.push.apply(this.arr, indices.map(RangeElem.single));
  }

  setSlice(from: number, to: number = -1, step : number = 1) {
    this.arr = [new RangeElem(from, to, step)];
  }
  setList(indices : number[]) {
    this.arr = Range1D.compress(indices);
  }

  at(index: number) : RangeElem {
    if (index < 0) {
      index += this.length;
    }
    if (index < 0 || index >= this.length) {
      return RangeElem.none();
    }
    return this.arr[index];
  }

  size(size:number) {
    return this.arr.map((d) => d.size(size)).reduce((a,b) => a+b, 0);
  }

  /**
   * combines this range with another and returns a new one
   * this = (1,3,4), sub = (2) -> (2)
   * (2)(1,2,3)
   * @param other
   * @returns {*}
   */
  preMultiply(sub:Range1D, size?:number):Range1D {
    if (this.isAll) {
      return sub.clone();
    }
    if (sub.isAll) {
      return this.clone();
    }
    //TODO optimize
    var l = this.iter(size).asList();
    var s = sub.iter(l.length);
    var r = new Array<number>();
    while(s.hasNext()) {
      r.push(l[s.next()]);
    }
    return Range1D.from(r);
  }

  /**
   * logical union between two ranges
   * @param other
   * @returns {RangeDim}
   */
  union(other:Range1D, size?: number) {
    if (this.isAll || other.isNone) {
      return this.clone();
    }
    if (other.isAll || this.isNone) {
      return other.clone();
    }
    var r = this.iter(size).asList();
    var it2 = other.iter(size);
    it2.forEach((i) => {
      if (r.indexOf(i) < 0) {
        r.push(i);
      }
    });
    return Range1D.from(r.sort());
  }

  /**
   * logical intersection between two ranges
   * @param other
   * @returns {RangeDim}
   */
  intersect(other:Range1D, size?: number) {
    if (this.isNone || other.isNone) {
      return Range1D.none();
    }
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    var it1 = this.iter(size).asList();
    var it2 = other.iter(size);
    var r = new Array<number>();
    it2.forEach((i) => {
      if (it1.indexOf(i) >= 0) {
        r.push(i);
      }
    });
    return Range1D.from(r.sort());
  }

  /**
   * logical difference between two ranges
   * @param other
   * @returns {RangeDim}
   */
  without(without:Range1D, size?: number) {
    if (this.isNone || without.isNone) {
      return this.clone();
    }
    if (without.isAll) {
      return Range1D.none();
    }
    var it1 = this.iter(size);
    var it2 = without.iter(size).asList();
    var r = new Array<number>();
    it1.forEach((i) => {
      if (it2.indexOf(i) < 0) {
        r.push(i);
      }
    });
    return Range1D.from(r.sort());
  }

  /**
   * clones this range
   * @returns {RangeDim}
   */
  clone() {
    return new Range1D(this.arr.map((d) => d.clone()));
  }

  /**
   * inverts the given index to the original range
   * @param index
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  invert(index: number, size?: number) {
    if (this.isAll) {
      return index;
    }
    if (this.isNone) {
      return -1; //not mapped
    }
    var act = 0, s = this.arr[0].size(size), total :number = s;
    while (total > index && act < this.length) {
      act++;
      s = this.arr[act].size(size);
      total += s;
    }
    if (act >= this.arr.length) {
      return -1; //not mapped
    }
    return this.arr[act-1].invert(index - total + s,size);
  }

  indexOf(indices: number[]) : number[];
  indexOf(index: number): number;
  indexOf(...index: number[]) : number[];
  indexOf() : any {
    var arr: number[];
    var base = this.iter().asList();
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'number') {
        return base.indexOf(<number>arguments[0]);
      }
      arr = arguments[0];
    } else {
      arr = C.argList(arguments);
    }
    if (arr.length === 0) {
      return [];
    }
    return arr.map((index, i) => base.indexOf(index));
  }

  indexRangeOf(r : Range1D, size?: number) {
    if (r.isNone || this.isNone) {
      return Range1D.none();
    }
    var arr = this.iter().asList();
    var result = [];
    r.forEach((d) => {
      var i = arr.indexOf(d);
      if (i >= 0) {
        result.push(i);
      }
    });
    return Range1D.from(result);
  }

  /**
   * filters the given data according to this range
   * @param data
   * @param size the total size for resolving negative indices
   * @returns {*}
   */
  filter(data:any[], size:number, transform:(any) => any = C.identity) {
    if (this.isAll) {
      return data.map(transform);
    }
    var it = this.iter(size);
    //optimization
    if (it.byOne && it instanceof Iterator.Iterator) {
      return data.slice((<Iterator.Iterator><any>it).from, (<Iterator.Iterator><any>it).to).map(transform);
      //} else if (it.byMinusOne) {
      //  var d = data.slice();
      //  d.reverse();
      //  return d;
    } else {
      var r = [];
      while (it.hasNext()) {
        r.push(transform(data[it.next()]));
      }
      return r;
    }
  }

  /**
   * creates an iterator of this range
   * @param size the underlying size for negative indices
   */
  iter(size?: number):Iterator.IIterator<number> {
    if (this.isList) {
      return Iterator.forList(this.arr.map((d) => d.from));
    }
    return Iterator.concat.apply(Iterator, this.arr.map((d) => d.iter(size)));
  }

  forEach(callbackfn: (value: number) => void, thisArg?: any): void {
    return this.iter().forEach(callbackfn, thisArg);
  }

  toString() {
    if (this.isAll) {
      return '';
    }
    if (this.length === 1) {
      return this.arr[0].toString();
    }
    return '('+this.arr.join(',')+')';
  }

  static parse(code : string) {
    var r = new Range1D();
    code = code.trim();
    if (code.length >= 2 && code.charAt(0) === '(' && code.charAt(code.length-1) === ')') {
      r.push.apply(r, code.substr(1,code.length-2).split(',').map(RangeElem.parse));
    } else {
      r.push(RangeElem.parse(code));
    }
    return r;
  }
}
/**
 * multi dimensional version of a RangeDim
 */
export class Range {
  constructor(public dims = new Array<Range1D>()) {

  }

  /**
   * checks if this range is all
   * @returns {boolean}
   */
  get isAll() {
    return this.dims.every((dim) => dim.isAll);
  }

  get isNone() {
    return this.dims.every((dim) => dim.isNone);
  }

  /**
   * number of defined dimensions
   * @returns {number}
   */
  get ndim() {
    return this.dims.length;
  }

  eq(other: Range) {
    if ((this.isAll && other.isAll) || (this.isNone && other.isNone)) {
      return true;
    }
    //TODO more performant comparison
    return this.toString() == other.toString();
  }

  /**
   * combines this range with another and returns a new one
   * this = (1,3,4), sub = (2) -> (2)
   * (2)(1,2,3)
   * @param other
   * @returns {*}
   */
  preMultiply(other:Range, size?:number[]) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.preMultiply(other.dims[i], size ? size[i] : undefined);
    });
    return r;
  }

  union(other:Range, size?:number[]) {
    if (this.isAll || other.isNone) {
      return this.clone();
    }
    if (other.isAll || this.isNone) {
      return other.clone();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.union(other.dims[i], size ? size[i] : undefined);
    });
    return r;
  }

  /**
   * logical intersection between two ranges
   * @param other
   * @returns {RangeDim}
   */
  intersect(other:Range, size?:number[]) {
    if (this.isNone || other.isNone) {
      return none();
    }
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.intersect(other.dims[i], size[i]);
    });
    return r;
  }

  /**
   * logical difference between two ranges
   * @param other
   * @returns {RangeDim}
   */
  without(without:Range, size:number[]) {
    if (this.isNone || without.isNone) {
      return this.clone();
    }
    if (without.isAll) {
      return none();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.without(without.dims[i], size? size[i]: undefined);
    });
    return r;
  }

  /**
   * clones this range
   * @returns {*}
   */
  clone() {
    var r = new Range();
    this.dims.forEach(function (d, i) {
      r.dims[i] = d.clone();
    });
    return r;
  }

  /**
   * create a new range and reverse the dimensions
   */
  swap() {
    var r = new Range();
    r.dims = this.dims.map((d) => d.clone()).reverse();
    return r;
  }

  /**
   * filter the given multi dimensional data according to the current range
   * @param data
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  filter(data:any[], size:number[]) {
    if (this.isAll) {
      return data;
    }
    var ndim = this.ndim;
    var that = this;
    //recursive variant for just filtering the needed rows
    function filterDim(i:number) {
      if (i >= ndim) { //out of range no filtering anymore
        return C.identity;
      }
      var d = that.dim(i);
      var next = filterDim(i + 1); //compute next transform
      var s = size ? size[i] : undefined;
      return (elem) => { //if the value is an array, filter it else return the value
        return C.isArray(elem) ? d.filter(elem, s, next) : elem;
      };
    }

    return filterDim(0)(data);
  }

  /**
   * return a specific dimension
   * @param dimension
   * @returns {r}
   */
  dim(dimension:number):Range1D {
    var r = this.dims[dimension];
    if (r) {
      return r;
    }
    //not yet existing create one
    this.dims[dimension] = Range1D.all();
    return this.dims[dimension];
  }

  /**
   * transforms the given multi dimensional indices to their parent notation
   * @param indices
   * @param size the underlying size for negative indices
   */
  invert(indices:number[], size?:number[]):number[] {
    if (this.isAll) {
      return indices;
    }
    return indices.map((index, i) => {
      return this.dim(i).invert(index, size ? size[i]: undefined);
    });
  }

  indexRangeOf(r : Range, size?:number[]) : Range {
    if (r.isNone || this.isNone) {
      return none();
    }
    if (this.isNone || r.isAll) {
      return this.clone();
    }
    return new Range(this.dims.map((d,i) => d.indexRangeOf(r.dim(i), size ? size[i] : undefined)));
  }

  indexOf(indices: number[]) : number[];
  indexOf(index: number): number;
  indexOf(...index: number[]) : number[];
  indexOf() : any {
    var arr: number[];
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'number') {
        return this.dim(0).indexOf(<number>arguments[0]);
      }
      arr = arguments[0];
    } else {
      arr = C.argList(arguments);
    }
    if (arr.length === 0) {
      return [];
    }
    return arr.map((index, i) => this.dim(i).indexOf(index));
  }
  /**
   * returns the range size
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  size(size:number[]):number[] {
    if (this.isAll) {
      return size;
    }
    return this.dims.map((r, i) => {
      return r.size(size[i]);
    });
  }

  /**
   * utility function for a generic version for calling all sub dimensions
   * @param name
   * @param args
   * @returns {*}
   */
  private gen(name, args):any {
    if (args.length === 0) {
      return this.dims.map(function (d) {
        return d[name].call(d);
      });
    }
    for (var i = 0; i < args.length; ++i) {
      if (args[i] !== undefined) {
        var d = this.dim(i);
        d[name].call(d, args[i]);
      }
    }
    return this;
  }

  split() : Range[] {
    return this.dims.map((dim) => {
      return new Range([dim]);
    });
  }

  /**
   * encoded the given range in a string
   */
  toString() {
    return this.dims.map(function (d) {
      return d.toString();
    }).join(',');
  }

  /**
   * parse the give code created toString
   * @param code
   * @returns {Range}
   */
  static parse(code:string) {
    var act = 0, c:string, next:number;
    var dims = new Array<Range1D>();
    code = code.trim();
    while (act < code.length) {
      c = code.charAt(act);
      if (c === '(') {
        next = code.indexOf(')', act);
        dims.push(Range1D.parse(code.substring(act, next + 1)));
        act = next + 1 + 1; //skip ),
      } else { //regular case
        next = code.indexOf(',', act);
        next = next < 0 ? code.length : next;
        dims.push(Range1D.parse(code.substring(act, next)));
        act = next + 1; //skip ,
      }
    }
    var r = new Range();
    r.dims = dims;
    return r;
  }
}
/**
 * creates a new range including everything
 * @returns {Range}
 */
export function all() {
  return new Range();
}
export function none() {
  var r = new Range();
  r.dims = [Range1D.none(),Range1D.none()];
  return r;
}

/**
 * test if the given object is a range
 */
export function is(obj:any) {
  return obj instanceof Range;
}

export function range(from: number, to?: number,step?: number)
export function range(...ranges : number[]);
export function range() {
  if (arguments.length === 0) {
    return all();
  }
  var r = new Range();
  if (C.isArray(arguments[0])) { //array mode
    C.argList(arguments).forEach((arr : number[], i) => {
      if (arr.length === 0) {
        return;
      }
      r.dim(i).setSlice(arr[0],arr[1],arr[2]);
    })
  }
  if (typeof arguments[0] === 'number') { //single slice mode
    r.dim(0).setSlice(arguments[0], arguments[1], arguments[2])
  }
  return r;
}
export function join(ranges : Range[]);
export function join(...ranges : Range[]);
export function join() {
  if (arguments.length === 0) {
    return all();
  }
  var r = new Range();
  var ranges = arguments[0];
  if (!C.isArray(ranges)) { //array mode
    ranges = C.argList(arguments);
  }
  r.dims = ranges.map((r) => r.dim(0));
  return r;
}

export function list(...indices: number[]);
export function list(...indexarrays : number[][]);
export function list(...dims : Range1D[]);
export function list(dims : Range1D[]);
export function list() {
  if (arguments.length === 0) {
    return all();
  }
  var r = new Range();
  if (C.isArray(arguments[0])) { //array mode
    C.argList(arguments).forEach((arr : any, i) => {
      if (arr instanceof Range1D) {
        r.dims[i] = arr;
      } else {
        r.dim(i).setList(arr);
      }
    })
  } else if (typeof arguments[0] === 'number') { //single slice mode
    r.dim(0).setList(C.argList(arguments));
  } else if (arguments[0] instanceof Range1D) {
    r.dims = C.argList(arguments);
  }
  return r;
}

/**
 * parses the given encoded string created by toString to a range object
 * @param encoded
 * @returns {Range}
 */
export function parse(...encoded:string[]) {
  if (encoded.length === 0) {
    return all();
  }
  return Range.parse(encoded.join(','));
}