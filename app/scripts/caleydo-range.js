/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo'], function (C) {
  'use strict';
  function create() {
    var from = 0, to = -1, step = -1;
    var r = function() {
      //TODO apply
    };
    r.from = function(val) {
      from = val;
      return this;
    };
    r.to = function(val) {
      to = val;
      return this;
    };
    r.step = function(step) {
      step = step;
      return this;
    };
    r.slice = function(from, to) {
      return this.from(from).to(to);
    };

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