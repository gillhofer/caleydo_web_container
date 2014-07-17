/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['jquery'], function ($) {
  'use strict';
  return {
    version: '0.0.1-alpha',

    promised: function promised(resolver) {
      var d = $.Deferred;
      resolver.call(this, function(r) {
        d.resolve(r);
      }, function(r) {
        d.reject(r);
      });
      return d.promise();
    },
    resolved : function resolved(result) {
      return this.promised(function(resolve) {
        resolve(result);
      });
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

    identity: function (d) {
      return d;
    },
    noop: function () {
    }
  };
});

