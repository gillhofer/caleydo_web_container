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
    extend : function(a,b) {
      return $.extend({},a,b);
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
    }
  };
});

