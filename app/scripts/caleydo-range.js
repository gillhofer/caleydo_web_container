/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo','caleydo-iterator'], function (C, Iterator) {
  'use strict';
  function RangeDim() {
    this._from = 0;
    this._to = -1;
    this._step = 1;
  }
  Object.defineProperties(RangeDim.prototype, {
    isAll : function() {
      return this._from === 0 && this._to === -1 && this._step === 1;
    }
  });
  RangeDim.prototype.from = function(val) {
    this._from = val;
    return this;
  };
  RangeDim.prototype.to = function(val) {
    this._to = val;
    return this;
  };
  RangeDim.prototype.step = function(step) {
    this._step = step;
    return this;
  };
  RangeDim.prototype.slice = function(from, to, step) {
    this._from = C.isUndefined(from) ? 0 : from;
    this._to = C.isUndefined(to) ? -1 : to;
    this._step = C.isUndefined(step) ? this._step : step;
    return this;
  };
  RangeDim.prototype.invert = function(index, size) {
    if (this.isAll) {
      return index;
    }
    var r = this.iter(size);
  };
  RangeDim.prototype.filter = function(data, size) {
    if (this.isAll) {
      return data;
    }
    var r = this.iter(size);
  };
  /**
   * creates an iterator of this range
   * @param size
   */
  RangeDim.prototype.iter = function(size) {
    var f = function(v) {
      return v < 0 ? (size + 1 - v) : v;
    }
    return new Iterator(f(this._from), f(this._to), this._step);
  };


  function createRange() {
    var r = function Range() {
      return this.filter.apply(this, Array.prototype.slice(arguments));
    };


    /**
     * combines this range with another one
     */
    r.times = function(other, dim) {
      if (this.isAll) {
        return other.clone();
      }
      if (other.isAll) {
        return this.clone();
      }
      return this.clone(); //FIXME
    };
    /**
     * clones this range
     * @returns {*}
     */
    r.clone = function() {
      return createRange().slice(that.from, that.to, that.step);
    };
    /**
     * create a new range and reverse the dimensions
     */
    r.swap = function() {
      //FIXME
      return createRange();
    };
    /**
     * filter the given multi dimensional data according to the current range
     * @param data
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    r.filter = function(data, size) {
      if (this.isAll) {
        return data;
      }
      //FIXME
      return data;
    };
    /**
     * return a specific dimension
     * @param dimension
     * @returns {r}
     */
    r.dim = function(dimension) {
      return this; //FIXME
    }
    /**
     * transforms the given multi dimensional indices to their parent notation
     * @param indices
     * @param size the underlying size for negative indices
     */
    r.invert = function(indices, size) {
      if (this.isAll) {
        return indices;
      }
      //FIXME
      return indices;
    };
    /**
     * returns the range size
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    r.size = function(size) {
      return size;
    }

    /**
     * encoded the given range in a string
     */
    r.toString = function() {
      return "";
    }

    return r;
  }
  return {
    /**
     * creates a new range including everything
     * @returns {*}
     */
    all: function() {
      return createRange();
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
    },

    parse : function(encoded) {
      return create(); //FIXME
    }
  };
});