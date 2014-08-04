/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('caleydo');
import Iterator = require('caleydo-iterator');

'use strict';
export class RangeDim {
  private _from:any = 0;
  private _to:number = -1;
  private _step:number = 1;

  get isAll() {
    return this._from === 0 && this._to === -1 && this._step === 1;
  }

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

  times(other) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    return this.clone(); //FIXME
  }

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

  filter(data, size) {
    if (this.isAll) {
      return data;
    }
    var it = this.iter(size);
    if (it.byOne && it instanceof Iterator.Iterator) {
      return data.slice((<Iterator.Iterator><any>it).from, (<Iterator.Iterator><any>it).to);
      //} else if (it.byMinusOne) {
      //  var d = data.slice();
      //  d.reverse();
      //  return d;
    } else {
      var r = [];
      while (it.hasNext()) {
        r.push(data[it.next()]);
      }
      return r;
    }
  }

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
}

export class Range {
  dims = new Array<RangeDim>();

  /**
   * checks if this range is all
   * @returns {boolean}
   */
  get isAll() {
    return this.dims.every((dim) => dim.isAll);
  }

  /**
   * combines this range with another one
   */
  times(other: Range, size: number[]) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    var r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.times(other.dims[i]);
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
    this.dims.forEach(function (d, i) {
      r.dims[this.dims.length - 1 - i] = d.clone();
    });
    return r;
  }
  /**
   * filter the given multi dimensional data according to the current range
   * @param data
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  filter(data: any[], size: number) {
    if (this.isAll) {
      return data;
    }
    //FIXME
    return data;
  }

  /**
   * return a specific dimension
   * @param dimension
   * @returns {r}
   */
  dim(dimension: number) {
    var r = this.dims[dimension];
    if (r) {
      return r;
    }
    this.dims[dimension] = new RangeDim();
    return this.dims[dimension];
  }

  /**
   * transforms the given multi dimensional indices to their parent notation
   * @param indices
   * @param size the underlying size for negative indices
   */
  invert(indices : number[], size: number) : number[] {
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
    //FIXME
    return size;
  }
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
}
/**
 * creates a new range including everything
 * @returns {*}
 */
export function all() {
  return new Range();
}
export function from() {
  var r = this.all();
  return r.from.apply(r, C.argList(arguments));
}
export function list() {
  var r = this.all();
  return r.list.apply(r, C.argList(arguments));
}
/**
 * test if the given object is a range
 */
export function is(obj: any) {
  return obj instanceof Range; //FIXME
}

export function parse(encoded : string) {
  return all(); //FIXME
}