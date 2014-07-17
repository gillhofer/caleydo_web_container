/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo'], function (C) {
  'use strict';
  var cache = {};
  return {
    resolve : function(name) {
      return name; //FIXME cache and resolve
    },
    list : function() {
      return cache;
    },
    register: function(name, idtype) {
      if (cache.hasOwnProperty(name)) {
        return cache[name];
      }
      cache[name] = idtype;
      return idtype;
    }
  }
});