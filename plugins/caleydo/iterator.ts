/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
/**
 * basic iterator interface
 */
export interface IIterator<T> {
  hasNext() : boolean;
  next() : T;
  /**
   * converts this whole itertor into an array
   */
  asList() : T[];

  isIncreasing : boolean;
  isDecreasing : boolean;
  /**
   * increases by one
   */
  byOne : boolean;
  /**
   * decreases by one
   */
  byMinusOne : boolean;

  forEach(callbackfn: (value: T) => void, thisArg?: any): void;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(callbackfn: (value: T) => U, thisArg?: any): IIterator<U>;
}

export class AIterator<T> {
  hasNext() : boolean {
    return false;
  }
  next() : T {
    return null;
  }

  forEach(callbackfn: (value: T) => void, thisArg?: any): void {
    var i = 0;
    while (this.hasNext()) {
      callbackfn.call(thisArg, this.next(), i++);
    }
  }

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(callbackfn: (value: T) => U, thisArg?: any): IIterator<U> {
    return new TransformIterator(this, callbackfn, thisArg);
  }

  /**
   * converts the remaining of this iterator to a list
   * @returns {Array}
   */
  asList() {
    var r = [];
    while (this.hasNext()) {
      r.push(this.next());
    }
    return r;
  }

  get isIncreasing() {
    return false;
  }

  get isDecreasing() {
    return false;
  }

  get byOne() {
    return false;
  }

  get byMinusOne() {
    return false;
  }
}
/**
 * iterator for a given range
 */
export class Iterator extends AIterator<number> implements IIterator<number>{

  private act:number;

  constructor(public from:number, public to:number, public step:number) {
    super();
    this.act = this.from;
  }

  /**
   * whether more items are available
   */
  hasNext() {
    return this.act !== this.to && ((this.step > 0 && this.act < this.to) || (this.step < 0 && this.act > this.to));
  }

  /**
   * returns the next item
   */
  next() {
    if (!this.hasNext()) {
      throw new RangeError('end of iterator');
    }
    var r = this.act;
    this.act += this.step;
    if (this.step < 0 && this.act < this.to) {
      this.act = this.to;
    } else if (this.step > 0 && this.act > this.to) {
      this.act = this.to;
    }
    return r;
  }

  get isIncreasing() {
    return this.step > 0;
  }

  get isDecreasing() {
    return this.step < 0;
  }

  get byOne() {
    return this.step === 1;
  }

  get byMinusOne() {
    return this.step === -1;
  }

  get size() {
    if (this.byOne) {
      return Math.max(this.to - this.from,0);
    } else if (this.byMinusOne) {
      return Math.max(this.from - this.to,0);
    }
    var d = this.isIncreasing ? (this.to - this.from+1) : (this.from - this.to+1);
    var s = Math.abs(this.step);
    if (d <= 0) { //no range
      return 0;
    }
    return Math.floor(d/s);
  }
}

export class ListIterator<T> extends AIterator<T> implements IIterator<T>{
  private it:Iterator;

  constructor(public arr:T[]) {
    super();
    this.it = new Iterator(0, arr.length, 1);
  }

  /**
   * whether more items are available
   */
  hasNext() {
    return this.it.hasNext();
  }

  /**
   * returns the next item
   */
  next() {
    if (!this.hasNext()) {
      throw new RangeError('end of iterator');
    }
    return this.arr[this.it.next()];
  }

  asList() {
    return this.arr.slice();
  }
}

export class SingleIterator<T> extends AIterator<T> implements IIterator<T>{
  private delivered = false;
  constructor(private value: T) {
    super();
  }

  hasNext() {
    return !this.delivered;
  }

  next() {
    if (!this.hasNext()) {
      throw new RangeError('end of iterator');
    }
    this.delivered = true;
    return this.value;
  }

  asList() {
    return [this.value];
  }

  get isIncreasing() {
    return true;
  }

  get isDecreasing() {
    return true;
  }

  get byOne() {
    return true;
  }

  get byMinusOne() {
    return true;
  }
}

export class ConcatIterator<T> extends AIterator<T> implements IIterator<T>{

  private act : IIterator<T>;

  constructor(private its:IIterator<T>[]) {
    super();
    this.act = its.shift();
  }

  /**
   * whether more items are available
   */
  hasNext() {
    //based on http://grepcode.com/file/repo1.maven.org/maven2/com.google.guava/guava/r08/com/google/common/collect/Iterators.java#Iterators.concat%28java.util.Iterator%29
    var currentHasNext = false;
    while (!(currentHasNext = this.act.hasNext()) && this.its.length > 0) {
      this.act = this.its.shift();
    }
    return currentHasNext;
  }

  /**
   * returns the next item
   */
  next() {
    if (!this.hasNext()) {
      throw new RangeError('end of iterator');
    }
    return this.act.next();
  }

  /**
   * converts the remaining of this iterator to a list
   * @returns {Array}
   */
  asList() {
    var r = [];
    while (this.hasNext()) {
      r.push(this.next());
    }
    return r;
  }

  get isIncreasing() {
    return this.its.every((it => it.isIncreasing));
  }

  get isDecreasing() {
    return this.its.every((it => it.isDecreasing));
  }

  get byOne() {
    return this.its.every((it => it.byOne));
  }

  get byMinusOne() {
    return this.its.every((it => it.byMinusOne));
  }
}

export class EmptyIterator<T> extends AIterator<T> implements IIterator<T>{
  isIncreasing = false;
  isDecreasing = false;
  byOne = false;
  byMinusOne = false;

  /**
   * whether more items are available
   */
  hasNext() {
    return false;
  }

  /**
   * returns the next item
   */
  next() : T {
    throw new RangeError('end of iterator');
  }

  /**
   * converts the remaining of this iterator to a list
   * @returns {Array}
   */
  asList() {
    return [];
  }
}

class TransformIterator<O,T> extends AIterator<T> implements IIterator<T>{
  constructor(private it : IIterator<O>, private f : (elem: O) => T, private thisArg? : any) {
    super();
  }
  /**
   * whether more items are available
   */
  hasNext() {
    return this.it.hasNext();
  }

  /**
   * returns the next item
   */
  next() {
    if (!this.hasNext()) {
      throw new RangeError('end of iterator');
    }
    return this.f.call(this.thisArg, this.it.next());
  }

  get isIncreasing() {
    return this.it.isIncreasing;
  }

  get isDecreasing() {
    return this.it.isDecreasing;
  }

  get byOne() {
    return this.it.byOne;
  }

  get byMinusOne() {
    return this.it.byMinusOne;
  }
}

export function empty<T>() {
  return new EmptyIterator<T>();
}

export function concat<T>(...its : IIterator<T>[]) {
  if (its.length === 0) {
    return empty();
  } else if (its.length === 1) {
    return its[0];
  }
  return new ConcatIterator<T>(its);
}

/**
 * creates a new iterator for the given range
 * @param from
 * @param to
 * @param step
 * @returns {Iterator}
 */
export function range(from:number, to:number, step:number) {
  return new Iterator(from, to, step);
}

export function single(value: number) {
  return new SingleIterator(value);
}

/**
 * creates a new iterator for the given list
 * @param arr
 * @returns {ListIterator}
 */
export function forList<T>(arr:T[]) {
  return new ListIterator<T>(arr);
}
