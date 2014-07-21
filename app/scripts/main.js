/*global require */
require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery'
  }
});

require([
    'app',
    'jquery',
    './caleydo',
    './caleydo-data'
  ], function (app, $, C, data) {
    'use strict';
    // use app here
    var a = 5;
    console.log(app);
    console.log(C.version);
    //console.log('Running jQuery ', $().jquery);
    data.list().then(function(descs) {
      console.log(JSON.stringify(Object.keys(descs)));
    });
    data.get('test')
      .then(function (matrix) {
        //matrix(1,2,3);
        matrix.on("loaded", function() {
          console.log("loaded");
        });
        return matrix.rows();
      })
      .then(function (v) {
        console.log(v);
      });
  }
);
