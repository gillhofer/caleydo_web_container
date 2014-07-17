/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['caleydo','caleydo-matrix'], function (C, Matrix) {
  var cache = undefined;
  return {
    list : function() {
      if (cache) {
        return C.resolved(cache);
      }
      return C.getJSON("data/index.json").then(function(r) {
        cache = r;
        return r;
      });
    }
  };
});