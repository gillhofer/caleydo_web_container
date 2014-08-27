/*global require */
require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '/bower_components/jquery/jquery',
    'jquery-ui-js': '/bower_components/jquery-ui/ui/jquery-ui',
    d3: '/bower_components/d3/d3',
    'caleydo-plugins-gen': './caleydo-plugins-gen',
    'd3.parcoords': '/bower_components/d3.parcoords/index'
  },
  map: {
    '*': {
      'css': '/bower_components/require-css/css.js' // or whatever the path to require-css is
    }
  },
  shim: {
    'd3.parcoords': {
      deps: ['css!/bower_components/d3.parcoords-css/index', 'd3'],
      exports: 'd3.parcoords'
    }
  },
  bundles: {
    'wrapper-bundle': ['jquery-ui']
  }
});

require([
    'jquery',
    './caleydo',
    './caleydo-data',
    './caleydo-range',
    './caleydo-plugins',
    './window/index'
  ], function ($, C, data, range, plugins, window) {
    'use strict';
    // use app here
    var a = 5;
    var $body = $('body');
    console.log(C.version);
    console.log(JSON.stringify(plugins.list()));
    //load and excute the auto load plugins
    plugins.load(plugins.list('autoload')).then(function (plugins) {
      plugins.forEach(function (p) {
        p.factory($body[0]);
      });
    });
    //console.log('Running jQuery ', $().jquery);
    data.list().then(function (descs) {
      console.log(JSON.stringify(Object.keys(descs)));
    });
    data.get('0')
      .then(function (matrix) {
        //matrix(1,2,3);
        matrix.on("loaded", function () {
          console.log("loaded");
        });
        var m = matrix; //.view(range.parse('0:5,1:6'));
        plugins.load(plugins.listVis(m)).then(function (visses) {
          var acc = 10;
          visses.forEach(function (plugin) {
            var w = window.create($body[0]);
            w.title = plugin.desc.name;
            w.pos = [20, acc];
            if (typeof plugin.desc.size === 'function') {
              w.contentSize = plugin.desc.size(m.dim);
            } else {
              w.contentSize = [200, 200];
            }
            plugin.factory(m, w.node);
            var s = w.size;
            acc += s[1]+10;
          });
        });
        return matrix.rows();
      })
      .then(function (v) {
        console.log(v);
      });
  }
);
