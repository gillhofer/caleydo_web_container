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

require(['jquery', 'd3', './caleydo-data', './caleydo-plugins', './window/index', './caleydo-multiform' ], function ($, d3, data, plugins, window, multiform) {
  'use strict';
  autoload(plugins);
  // use app here
  var $body = $('body');

  /*
  data.get('0').then(function (matrix) {
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
    multi.on('change', function (event, new_) {
      mw.title = new_.name;
      mw.contentSize = multi.size;
    });
  });*/

  function addIt(m) {
    var mw = window.create($body[0], {
      closeable: true
    });
    var multi = multiform.create(m, mw.node);
    mw.title = m.desc.name + ' @ ' + multi.act.name;
    mw.pos = [400, 10];
    mw.contentSize = multi.size;
    multi.on('change', function (event, new_) {
      mw.title = m.desc.name + ' @ ' + new_.name;
      mw.contentSize = multi.size;
    });
  }

  data.list().then(function (list) {
    var b = d3.select('body');
    b.append('span').text('Select Dataset: ');
    var $select = b.append('select').attr('class', 'dataselector');
    list = d3.entries(list);
    list.splice(0, 0, {});
    var $options = $select.selectAll('option').data(list);
    $options.enter().append('option').text(function (d) {
      return d.value ? d.value.desc.name : '';
    });
    $select.on('change', function () {
      var i = $select.node().selectedIndex;
      if (i <= 0) {
        return;
      }
      var l = list[i];
      addIt(l.value);
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
