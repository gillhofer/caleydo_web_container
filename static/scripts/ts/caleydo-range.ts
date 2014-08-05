/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./caleydo');
import Iterator = require('./caleydo-iterator');
'use strict';
/**
 * a range dim is a range for a specific dimension
 */
export class RangeDim {
  /**
   * from marker to list
   * @type {number}
   * @private
   */
  private _from:any = 0;
  /**
   * to
   * @type {number}
   * @private
   */
  private _to:number = -1;
  /**
   * step if = 0 then _from should be a list
   * @type {number}
   * @private
   */
  private _step:number = 1;

  /**
   * whether this range returns all data, i.e, doesn't filter anything
   * @returns {boolean}
   */
  get isAll() {
    return this._from === 0 && this._to === -1 && this._step === 1;
  }

  /**
   * whether this range has internal a list of items instead of a range
   * @returns {boolean}
   */
  get isList() {
    return C.isArray(this._from);
  }

  from():number;

  from(val:number):RangeDim;

  from(val?:number):any {
    if (arguments.length < 1) {
      return this._from;
    }
    if (this.isList) {
      this._step = 1;
    }
    this._from = val;
    return this;
  }

  to():number;

  to(val:number):RangeDim;

  to(val?:number):any {
    if (arguments.length < 1) {
      return this._to;
    }
    if (this.isList) {
      throw new Error('range is in list mode, set a from first');
    }
    this._to = val;
    return this;
  }

  step():number;

  step(val:number):RangeDim;

  step(val?:number):any {
    if (arguments.length < 1) {
      return this._step;
    }
    if (val === 0) {
      throw new Error('step === 0');
    }
    this._step = val;
    return this;
  }


  list():number[];

  list(val:number[]):RangeDim;

  list(val?:number[]):any {
    if (arguments.length < 1) {
      return this.isList ? <number[]>this._from : [];
    }
    this._from = val;
    this._to = -1;
    this._step = 0; //marker that this is the list mode
    return this;
  }


  slice(from, to, step) {
    this._from = C.isUndefined(from) ? 0 : from;
    this._to = C.isUndefined(to) ? -1 : to;
    this._step = C.isUndefined(step) ? this._step : step;
    return this;
  }

  /**
   * size of this range given the total size
   * @param size
   * @returns {*}
   */
  size(size: number) {
    if (this.isList) {
      return this.list().length;
    }
    var it = <Iterator.Iterator><any>this.iter(size);
    return it.size;
  }

  /**
   * combines this range with another and returns a new one
   * this = (1,3,4), sub = (2) -> (2)
   * (2)(1,2,3)
   * @param other
   * @returns {*}
   */
  preMultiply(sub: RangeDim, size: number) : RangeDim {
    if (this.isAll) {
      return sub.clone();
    }
    if (sub.isAll) {
      return this.clone();
    }
    var s = this.size(size);
    var r = new RangeDim();
    //if one is a list then the result is a list, too
    if (this.isList) {
      return r.list(sub.filter(this.list(), s));
    } else if (sub.isList) {
      return r.list(sub.filter(this.iter(size).asList(), s));
    }
    r._step = sub._step * this._step;

    //FIXME not yet implement
    if (sub._from >= 0 == this._from >= 0) { //both same sign
        r._from = this._from + sub._from;
    } else if (sub._from < 0 && this._from < 0) {
        r._from = this._from +1 + sub._from; //-1 + 1 -1 = -1
    } else { //mixed

    }

    return r;
  }

  /**
   * clones this range
   * @returns {RangeDim}
   */
  clone() {
    return new RangeDim().slice(this._from, this._to, this._step);
  }

  /**
   * inverts the given index to the original range
   * @param index
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  invert(index, size) {
    if (this.isAll) {
      return index;
    }
    if (this.isList) {
      return this.list()[index];
    }
    return this.fix(this.from(), size) + index * this._step;
  }

  /**
   * filters the given data according to this range
   * @param data
   * @param size the total size for resolving negative indices
   * @returns {*}
   */
  filter(data : any[], size : number, transform : (any) => any = C.identity) {
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
   * fix negative indices given the total size
   * @param v
   * @param size
   * @returns {number}
   */
  private fix(v:number, size:number) {
    return v < 0 ? (size + 1 - v) : v;
  }

  /**
   * creates an iterator of this range
   * @param size the underlying size for negative indices
   */
  iter(size):Iterator.IIterator<number> {
    if (this.isList) {
      return Iterator.forList(this.list());
    }
    return Iterator.range(this.fix(this._from, size), this.fix(this._to, size), this._step);
  }

  toString() {
    if (this.isAll) {
      return '';
    }
    if (this.isList) {
      return '(' + this.list().join(',') + ')';
    }
    var r = this._from + ':' + this._to;
    if (this._step !== 1) {
      r += ':' + this._step;
    }
    return r;
  }

  /**
   * parses the given code created by toString
   * @param code
   * @returns {RangeDim}
   */
  static fromString(code: string) {
    var r = new RangeDim(), parts: string[];

    if (code.length === 0) {
      return r;
    }
    if (code.charAt(0) === '(') {
      parts = code.substring(1,code.length-1).split(',');
      r.list(parts.map((v) => parseInt(v)));
    } else {
      parts = code.split(':');
      r.slice(+parts[0],+parts[1], parts.length > 2 ? +parts[2] : 1);
    }
    return r;
  }
}

/**
 * multi dimensional version of a RangeDim
 */
export class Range {
  /**
   * the list of internal RangeDims
   * @type {any[]}
   */
  dims = new Array<RangeDim>();

  /**
   * checks if this range is all
   * @returns {boolean}
   */
  get isAll() {
    return this.dims.every((dim) => dim.isAll);
  }

  /**
   * number of defined dimensions
   * @returns {number}
   */
  get ndim() {
    return this.dims.length;
  }

  /**
   * combines this range with another and returns a new one
   * this = (1,3,4), sub = (2) -> (2)
   * (2)(1,2,3)
   * @param other
   * @returns {*}
   */
  preMultiply(other: Range, size: number[]) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.preMultiply(other.dims[i], size[i]);
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
  filter(data: any[], size: number[]) {
    if (this.isAll) {
      return data;
    }
    var ndim = this.ndim;
    var that = this;
    //recursive variant for just filtering the needed rows
    function filterDim(i: number) {
      if (i >= ndim) { //out of range no filtering anymore
        return C.identity;
      }
      var d = that.dim(i);
      var next = filterDim(i+1); //compute next transform
      var s = size[i];
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
  dim(dimension: number) : RangeDim {
    var r = this.dims[dimension];
    if (r) {
      return r;
    }
    //not yet existing create one
    this.dims[dimension] = new RangeDim();
    return this.dims[dimension];
  }

  /**
   * transforms the given multi dimensional indices to their parent notation
   * @param indices
   * @param size the underlying size for negative indices
   */
  invert(indices : number[], size: number[]) : number[] {
    if (this.isAll) {
      return indices;
    }
    return indices.map((index, i) => {
      return this.dim(i).invert(index, size[i]);
    });
  }

  /**
   * returns the range size
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  size(size: number[]) : number[] {
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
  private gen(name, args) : any{
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

  from() {
    return this.gen('from', arguments);
  }

  to() {
    return this.gen('to', arguments);
  }

  step() {
    return this.gen('step', arguments);
  }

  list() {
    return this.gen('list', arguments);
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
  static fromString(code : string) {
    var act = 0, c : string, next : number;
    var dims = new Array<RangeDim>();
    while(act < code.length) {
      c = code.charAt(act);
      if (c === '(') {
        next = code.indexOf(')',act);
        dims.push(RangeDim.fromString(code.substring(act,next+1)));
        act = next+1 +1; //skip ),
      } else { //regular case
        next = code.indexOf(',',act);
        next = next < 0 ? code.length : next;
        dims.push(RangeDim.fromString(code.substring(act, next)));
        act = next+1; //skip ,
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
/**
 * creates a new range starting at from
 * @returns {Range}
 */
export function from() {
  var r = this.all();
  return r.from.apply(r, C.argList(arguments));
}
/**
 * creates a new range using the given list
 * @returns {Range}
 */
export function list() {
  var r = this.all();
  return r.list.apply(r, C.argList(arguments));
}
/**
 * test if the given object is a range
 */
export function is(obj: any) {
  return obj instanceof Range;
}

/**
 * parses the given encoded string created by toString to a range object
 * @param encoded
 * @returns {Range}
 */
export function parse(encoded : string) {
  return Range.fromString(encoded);
}