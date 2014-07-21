/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define([], function () {
  'use strict';

  /**
   * Iterator instance for a range
   * @param from
   * @param to
   * @param step
   * @constructor
   */
  function Iterator(from, to, step) {
    this.from = from;
    this.to = to;
    this.step = step;
    this.act = this.from;
  }

  /**
   * whether more items are available
   */
  Iterator.prototype.hasNext = function() {
    return this.act !== this.to;
  };
  /**
   * returns the next item
   */
  Iterator.prototype.next = function() {
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
  };
  /**
   * converts the remaining of this iterator to a list
   * @returns {Array}
   */
  Iterator.prototype.asList = function() {
    var r = [];
    while (this.hasNext()) {
      r.push(this.next());
    }
    return r;
  };
  Object.defineProperties(Iterator.prototype, {
    /**
     * step > 0
     */
    isIncreasing: {
      enumerable: true,
      get: function () {
        return this.step > 0;
      }},
    /**
     * step < 0
     */
    isDecreasing: {
      enumerable: true,
      get: function () {
        return this.step < 0;
      }
    },
    /**)
     * step === 1
     */
    byOne: {
      enumerable: true,
      get: function () {
        return this.step === 1;
      }
    },
    /**
     * step === -1
     */
    byMinusOne: {
      enumerable: true,
      get: function () {
        return this.step === -1;
      }
    }
  });

  /**
   * special variant of an iterator for iterating a list
   * @param arr
   * @constructor
   */
  function ListIterator(arr) {
    this.arr = arr;
    this.it = new Iterator(0,arr.length,1);
  }
  ListIterator.prototype.hasNext = function() {
    return this.it.hasNext();
  };
  ListIterator.prototype.next = function() {
    if (!this.hasNext()) {
      throw new RangeError("end of iterator");
    }
    return this.arr[this.it.next()];
  };
  ListIterator.prototype.asList = function() {
    return this.arr;
  };
  Object.defineProperties(ListIterator.prototype, {
    isIncreasing: {
      enumerable: true,
      value : false
    },
    isDecreasing: {
      enumerable: true,
        value : false
    },
    byOne: {
      enumerable: true,
        value : false
    },
    byMinusOne: {
      enumerable: true,
        value : false
    }
  });

  /**
   * creates a new iterator for the given list
   * @param arr
   * @returns {ListIterator}
   */
  Iterator.forList = function(arr) {
    return new ListIterator(arr);
  };
  /**
   * creates a new iterator for the given range
   * @param from
   * @param to
   * @param step
   * @returns {Iterator}
   */
  Iterator.range = function(from,to,step) {
    return new Iterator(from,to,step);
  };

  return Iterator;
});