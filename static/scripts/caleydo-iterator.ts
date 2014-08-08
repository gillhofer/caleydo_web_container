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
}

/**
 * iterator for a given range
 */
export class Iterator implements IIterator<number>{

  private act:number;

  constructor(public from:number, public to:number, public step:number) {
    this.act = this.from;
  }

  /**
   * whether more items are available
   */
  hasNext() {
    return this.act !== this.to;
  }

  /**
   * returns the next item
   */
  next() {
    if (!this.hasNext()) {
      throw new RangeError("end of iterator");
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
    } else if (this.byMinusOne){
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

export class ListIterator<T> implements IIterator<T>{
  private it:Iterator;

  constructor(public arr:T[]) {
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
      throw new RangeError("end of iterator");
    }
    return this.arr[this.it.next()];
  }

  /**
   * converts the remaining of this iterator to a list
   * @returns {Array}
   */
  asList() {
    return this.arr;
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
 * creates a new iterator for the given range
 * @param from
 * @param to
 * @param step
 * @returns {Iterator}
 */
export function range(from:number, to:number, step:number) {
  return new Iterator(from, to, step);
}

/**
 * creates a new iterator for the given list
 * @param arr
 * @returns {ListIterator}
 */
export function forList<T>(arr:T[]) {
  return new ListIterator<T>(arr);
}