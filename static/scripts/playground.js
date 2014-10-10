/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

function autoload(plugins, container) {
  var autoload = {};
  //load and execute the auto load plugins
  plugins.load(plugins.list('autoload')).then(function (plugins) {
    plugins.forEach(function (p) {
      autoload[p.desc.name] = p.factory(container);
    });
  });
  return autoload;
}

require(['jquery', 'd3', './caleydo/data', './caleydo/plugin', './window/index', './caleydo/multiform' ], function ($, d3, data, plugins, window, multiform) {
  'use strict';
  var windows = $('<div>').css('position', 'absolute').appendTo('body')[0];
  var singletons = autoload(plugins, $('body')[0]);
  var menu = $('<div>').css('position', 'fixed').appendTo('body')[0];
  // use app here

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

  function removeLink(vis) {
    if (singletons.hasOwnProperty('links')) {
      singletons.links.remove(vis);
    }
  }

  function addLink(vis) {
    if (singletons.hasOwnProperty('links')) {
      singletons.links.push(vis);
    }
  }

  function updateLinks() {
    if (singletons.hasOwnProperty('links')) {
      singletons.links.update();
    }
  }

  function addIt(m) {
    var mw = window.create(windows, {
      closeable: true,
      animatedHeader: true,
      zcontrols: true
    });
    var multi = multiform.create(m, mw.node);
    multiform.addSimpleVisIconChooser(multi, mw.toolbar);
    mw.title = m.desc.name + ' @ ' + multi.act.name;
    mw.pos = [400, 10];
    mw.contentSize = multi.size;
    multi.on('change', function (event, new_) {
      mw.title = m.desc.name + ' @ ' + new_.name;
      mw.contentSize = multi.size;
    });
    var vis = mw.adapter(multi);
    mw.on('removed', function () {
      removeLink(vis);
    });
    mw.on('drag_stop', updateLinks);
    addLink(vis);
  }

  data.list().then(function (list) {
    var b = d3.select(menu);
    b.append('span').text('Select Dataset: ');
    var $select = b.append('select').attr('class', 'dataselector');
    //for all inhomogeneous add them as extra columns, too

    list = d3.entries(list);
    list.forEach(function (entry) {
      if (entry.value.desc.type === 'table') {
        list.push.apply(list, entry.value.cols().map(function (col) {
          return {
            key: entry.key + '.' + col.desc.name,
            value : col
          };
        }));
      }
    });
    list.unshift({});
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
