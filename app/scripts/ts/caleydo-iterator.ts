/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
export interface IIterator<T> {
  hasNext() : boolean;
  next() : T;
  asList() : T[];
  isIncreasing : boolean;
  isDecreasing : boolean;
  byOne : boolean;
  byMinusOne : boolean;
}

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