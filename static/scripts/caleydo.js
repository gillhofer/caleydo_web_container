/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['jquery'], function ($) {
  'use strict';
  /**
   * the Caleydo main object
   * @exports caleydo
   * @version 0.0.1-alpha
   */
  var caleydo = {
    /**
     * version of the core
     */
    version: '0.0.1-alpha',

    /**
     * wraps the given resolver function to be a promise
     * @param resolver
     * @param {function(resolve, reject)} resolver - the promise resolver
     * @returns {Promise} a promise object
     */
    promised: function promised(resolver) {
      var d = $.Deferred();
      resolver(function(r) {
        d.resolve(r);
      }, function(r) {
        d.reject(r);
      });
      return d.promise();
    },
    /**
     * wraps the given result as a promise
     * @param result - the result of the promise
     * @returns {Promise} a promise object
     */
    resolved : function resolved(result) {
      return $.Deferred().resolve(result).promise();
    },

    /**
     * async JSON loading
     * @see {@link http://api.jquery.com/jQuery.getJSON/}
     */
    getJSON : $.getJSON,
    /**
     * integrate b into a and override all duplicates
     * @param {Object} a
     * @param {Object} b
     * @returns {Object} a with extended b
     */
    mixin : function(a,b) {
      return $.extend(a,a,b);
    },

    //wrap function wrap jquery which may be overwritten replaced sometimes
    /**
     * test the given object is a function
     */
    isFunction: $.isFunction,
    /**
     * test if the argument t is an array
     */
    isArray: $.isArray,
    /**
     * test if the argument is an empty object, works just for testing objects
     */
    isEmptyObject: $.isEmptyObject,
    /**
     * test if the argument is a plain object, no subclassing
     */
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
     * just returns the argument in any case
     * @param r - the value to return
     * @returns {*}
     */
    constant: function(r) {
      return function() { return r};
    },

    /**
     * copies a plain object into a function and call a specific method onto direct call
     * @param obj - the
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
    },

    /**
     * converts the given arguments object into an array
     * @param args
     * @returns {*|Array}
     */
    argList : function (args) {
      if (arguments.length > 1) {
        return Array.prototype.slice.call(arguments);
      } else {
        return Array.prototype.slice.call(args);
      }
    }
  };

  return caleydo;
});

