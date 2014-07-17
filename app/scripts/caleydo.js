/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['jquery'], function ($) {
  'use strict';
  return {
    version: '0.0.1-alpha',

    promised: function promised(resolver) {
      var d = $.Deferred();
      resolver(function(r) {
        d.resolve(r);
      }, function(r) {
        d.reject(r);
      });
      return d.promise();
    },
    resolved : function resolved(result) {
      return $.Deferred().resolve(result).promise();
    },

    getJSON : $.getJSON,
    mixin : function(a,b) {
      return $.extend(a,a,b);
    },

    //wrap function wrap jquery which may be overwritten replaced sometimes
    isFunction: $.isFunction,
    isArray: $.isArray,
    isEmptyObject: $.isEmptyObject,
    isPlainObject: $.isPlainObject,

    /**
     * identity function
     */
    identity: function (d) {
      return d;
    },
    /**
     * no operation function
     */
    noop: function () {
    },

    /**
     * just returns the arugment in any case
     * @param r
     * @returns {*}
     */
    constant: function(r) {
      return function() { return r};
    },

    /**
     * copies a plain object into a function and call a specific method onto direct call
     * @param obj
     * @param f
     */
    callable: function (obj, f) {
      //assert this.isPlainObject(obj);
      function CallAbleFactory() {
        var that;

        function CallAble() {
          that[f].apply(that, Array.prototype.slice(arguments));
        }

        that = CallAble;
        C.mixin(CallAble, obj);
        return CallAble;
      }

      return CallAbleFactory;
    }
  };
});

