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
  }
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
  }
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
    }
  });

  return Iterator;
});