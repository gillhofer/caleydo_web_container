/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['./caleydo','./caleydo-iterator'], function (C, Iterator) {
  'use strict';
  function RangeDim() {
    this._from = 0;
    this._to = -1;
    this._step = 1;
  }
  Object.defineProperties(RangeDim.prototype, {
    /**
     * checks if this range is all
     * @returns {boolean}
     */
    isAll: {
      enumerable: true,
      get: function () {
        return this._from === 0 && this._to === -1 && this._step === 1;
      }
    },

    /**
     * whether this range is in a list mode
     */
    isList: {
      enumerable: true,
      get: function () {
        return C.isArray(this._from);
      }
    },

    /**
     * pseudo access to range array
     */
    arr: {
      enumerable: true,
      get: function () {
        return this.isList ? this._from : [];
      }
    }
  });
  RangeDim.prototype.from = function(val) {
    if (arguments.length < 1) {
      return this._from;
    }
    if (typeof val !== 'number') {
      throw { msg: "can just set numbers"};
    }
    if (this.isList) {
      this._step = 1;
    }
    this._from = val;
    return this;
  };
  RangeDim.prototype.to = function(val) {
    if (arguments.length < 1) {
      return this._to;
    }
    if (this.isList) {
      throw {msg: "range is in list mode, set a from first"};
    }
    if (typeof val !== 'number') {
      throw { msg: "can just set numbers"};
    }
    this._to = val;
    return this;
  };
  RangeDim.prototype.step = function(step) {
    if (arguments.length < 1) {
      return this._step;
    }
    if (step === 0) {
      throw {msg: "step === 0"};
    }
    if (typeof step !== 'number') {
      throw { msg: "can just set numbers"};
    }
    this._step = step;
    return this;
  };
  RangeDim.prototype.list = function(list) {
    if (arguments.length < 1) {
      if (C.isArray(this._from)) {
        return this._from;
      } else {
        return [];
      }
    }
    if (arguments.length == 1 && C.isArray(list)) {
      this._from = list;
    } else {
      this._from = Array.prototype.slice(arguments);
    }
    this._to = -1;
    this._step = 0; //marker that this is the list mode
    return this;
  };
  RangeDim.prototype.slice = function(from, to, step) {
    this._from = C.isUndefined(from) ? 0 : from;
    this._to = C.isUndefined(to) ? -1 : to;
    this._step = C.isUndefined(step) ? this._step : step;
    return this;
  };
  RangeDim.prototype.times = function(other) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    return this.clone(); //FIXME
  };
  RangeDim.prototype.clone = function() {
    return new RangeDim().slice(this._from, this._to, this._step);
  };
  /**
   * inverts the given index to the original range
   * @param index
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  RangeDim.prototype.invert = function(index, size) {
    if (this.isAll) {
      return index;
    }
    if (this.isList) {
      return this.arr[index];
    }
    var r = this.iter(size);
    return r.from + index * r.step;
  };
  RangeDim.prototype.filter = function(data, size) {
    if (this.isAll) {
      return data;
    }
    var it = this.iter(size);
    if (it.byOne) {
      return data.slice(it.from, it.to);
    //} else if (it.byMinusOne) {
    //  var d = data.slice();
    //  d.reverse();
    //  return d;
    } else {
      var r = [];
      while(it.hasNext()) {
        r.push(data[it.next()]);
      }
      return r;
    }
  };
  /**
   * creates an iterator of this range
   * @param size the underlying size for negative indices
   */
  RangeDim.prototype.iter = function(size) {
    if (this.isList) {
      return Iterator.forList(this._from);
    }
    var f = function(v) {
      return v < 0 ? (size + 1 - v) : v;
    };
    return Iterator.range(f(this._from), f(this._to), this._step);
  };
  RangeDim.prototype.toString = function() {
    if (this.isList) {
      return '('+this.arr.join(',')+')';
    }
    var r = this._from  + ':' + this._to;
    if (this._step !== 1) {
      r += ':' + this._step;
    }
    return r;
  };


  function createRange() {
    var dims = [];
    var r = function Range() {
      return this.filter.apply(this, Array.prototype.slice(arguments));
    };
    Object.defineProperties(RangeDim.prototype, {
      /**
       * checks if this range is all
       * @returns {boolean}
       */
      isAll: {
        enumerable: true,
        get: function () {
          return dims.every(function(dim) {
            return dim.isAll;
          });
        }
      },
      dims: {
        enumerable: true,
        get: function () {
          return dims;
        }
      }
    });


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
      var r = createRange();
      this.dims.forEach(function (d,i) {
        r.dims[i] = d.times(other.dims[i]);
      });
      return r;
    };
    /**
     * clones this range
     * @returns {*}
     */
    r.clone = function() {
      var r = createRange();
      this.dims.forEach(function (d,i) {
        r.dims[i] = d.clone();
      });
      return r;
    };
    /**
     * create a new range and reverse the dimensions
     */
    r.swap = function() {
      var r = createRange();
      this.dims.forEach(function (d,i) {
        r.dims[this.dims.length - 1 - i] = d.clone();
      });
      return r;
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
    r.invert = function(indices, size) {
      if (this.isAll) {
        return indices;
      }
      var that = this;
      return indices.map(function(index, i) {
        return this.dim(i).invert(index, size[i]);
      })
    };
    /**
     * returns the range size
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    r.size = function(size) {
      if (this.isList) {
        return this.arr.length;
      }

      //FIXME
      return size;
    }

    /**
     * encoded the given range in a string
     */
    r.toString = function() {
      return this.dims.map(function(d) { return d.toString(); }).join(',');
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
     * test if the given object is a range
     */
    is : function(obj) {
      return C.isFunction(obj); //FIXME
    },

    parse : function(encoded) {
      return createRange(); //FIXME
    }
  };
});