/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo'], function (C) {
  'use strict';
  function create() {
    var that = {
      from : 0,
      to : -1,
      step : 1
    };
    var r = function Range() {
      //TODO apply
    };
    r.from = function(val) {
      that.from = val;
      return this;
    };
    r.to = function(val) {
      that.to = val;
      return this;
    };
    r.step = function(step) {
      that.step = step;
      return this;
    };
    r.slice = function(from, to, step) {
      that.from = C.isUndefined(from) ? 0 : from;
      that.to = C.isUndefined(to) ? -1 : to;
      that.step = C.isUndefined(step) ? that.step : step;
      return this;
    };
    r.times = function(other, dim) {
      if (this.isAll) {
        return other.clone();
      }
      if (other.isAll) {
        return this.clone();
      }
      return this.clone(); //FIXME
    };
    r.clone = function() {
      return create().slice(that.from, that.to, that.step);
    };
    Object.defineProperties(r, {
      isAll : function() {
        return that.from === 0 && that.to === -1 && that.step === 1;
      }
    });

    return r;
  }
  return {
    /**
     * creates a new range including everything
     * @returns {*}
     */
    all: function() {
      return create();
    },
    /**
     * creates a new range starting at from
     * @param val
     * @returns {*}
     */
    from : function(val) {
      return all().from(val);
    },
    /**
     * creates a new range of the given slice
     * @param val
     * @returns {*}
     */
    slice : function(from, to) {
      return all().slice(from, to);
    },
    /**
     * test if the given object is a range
     */
    is : function(obj) {
      return C.isFunction(obj); //FIXME
    }
  };
});