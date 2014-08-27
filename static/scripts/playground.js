/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

require(['jquery', './caleydo', './caleydo-data', './caleydo-range', './caleydo-plugins', './window/index' ], function ($, C, data, range, plugins, window) {
  'use strict';
  // use app here
  var $body = $('body');
  //load and execute the auto load plugins
  plugins.load(plugins.list('autoload')).then(function (plugins) {
    plugins.forEach(function (p) {
      p.factory($body[0]);
    });
  });

  data.get('0').then(function (matrix) {
    matrix.on("loaded", function () {
      console.log("loaded");
    });
    var m = matrix;
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
        acc += s[1] + 10;
      });
    });
  });
});
