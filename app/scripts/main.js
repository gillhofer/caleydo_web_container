/*global require */
require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    d3 : '../bower_components/d3/d3'
  }
});

require([
    'app',
    'jquery',
    './ts/caleydo',
    './ts/caleydo-data',
    './ts/caleydo-plugins'
  ], function (app, $, C, data, plugins) {
    'use strict';
    // use app here
    var a = 5;
    console.log(app);
    console.log(C.version);
    console.log(JSON.stringify(plugins.list()));
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
        var visses = plugins.listVis(matrix);
        visses[0].load().then(function(plugin) {
          plugin.create(matrix, $('body')[0]);
        });
        return matrix.rows();
      })
      .then(function (v) {
        console.log(v);
      });
  }
);
