/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

function autoload(plugins) {
  var body = document.getElementsByTagName('body')[0];
  //load and execute the auto load plugins
  plugins.load(plugins.list('autoload')).then(function (plugins) {
    plugins.forEach(function (p) {
      p.factory(body);
    });
  });
}

require(['jquery', './caleydo-data', './caleydo-plugins', './window/index', './caleydo-multiform' ], function ($, data, plugins, window, multiform) {
  'use strict';
  autoload(plugins);
  // use app here
  var $body = $('body');

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
    var mw = window.create($body[0]);
    var multi = multiform.create(matrix, mw.node);
    mw.title = multi.act.name;
    mw.pos = [400, 10];
    mw.size = [300, 300];
    multi.on('change', function (new_) {
      mw.title = new_.name;
      mw.contentSize = multi.size;
    });
  });
});

/*require(['jquery', './caleydo-data', './caleydo-plugins', './caleydo-multiform' ], function ($, data, plugins, multiform) {
  'use strict';
  autoload(plugins);

  var $body = $('body');
  data.get('0').then(function (matrix) {
    var m = multiform.create(matrix, $body[0]);
  });
});*/
