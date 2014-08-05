/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['./caleydo','./caleydo-events'], function (C, events) {
  'use strict';
  var cache = undefined;

  function IDType() {
    events.EventHandler.call(this);
  }
  IDType.prototype = new events.EventHandler;

  function load() {
    if(cache) {
      return C.resolved(cache);
    }
    return C.getJSON('data/idtypes.json').then(function(c) {
      cache = c;
      return c;
    });
  }
  return {
    resolve : function(name) {
      return name; //FIXME cache and resolve
    },
    list : function() {
      return load();
    },
    register: function(name, idtype) {
      if (cache.hasOwnProperty(name)) {
        return cache[name];
      }
      cache[name] = idtype;
      return idtype;
    },
    IDType : IDType
  };
});