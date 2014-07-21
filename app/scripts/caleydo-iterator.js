/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define([], function () {
  'use strict';

  function Iterator(from, to, step) {
    this.from = from;
    this.to = to;
    this.step = step;
    this.act = this.from;
  }
  Iterator.prototype.hasNext = function() {
    return this.act !== this.to;
  };
  Iterator.prototype.next = function() {
    if (!this.hasNext()) {
      throw "end";
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
  Object.defineProperties(Iterator.prototype, {
    isIncreasing: {
      enumerable: true,
      get: function () {
        return this.step > 0;
      }},
    isDecreasing: {
      enumerable: true,
      get: function () {
        return this.step < 0;
      }
    },
    byOne: {
      enumerable: true,
      get: function () {
        return this.step === 1;
      }
    },
    byMinusOne: {
      enumerable: true,
      get: function () {
        return this.step === -1;
      }
    }
  });

  function ListIterator(arr) {
    this.arr = arr;
    this.it = new Iterator(0,arr.length,1);
  }
  ListIterator.prototype.hasNext = function() {
    return this.it.hasNext();
  };
  ListIterator.prototype.next = function() {
    if (!this.hasNext()) {
      throw "end";
    }
    return this.arr[this.it.next()];
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

  Iterator.forList = function(arr) {
    return new ListIterator(arr);
  };
  Iterator.range = function(from,to,step) {
    return new Iterator(from,to,step);
  };

  return Iterator;
});