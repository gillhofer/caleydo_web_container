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

require(['jquery', 'd3', './caleydo/main', './caleydo/data', './caleydo/plugin', './caleydo-window/main', './caleydo/multiform', './caleydo/idtype' ], function ($, d3, C, data, plugins, window, multiform, idtypes) {
  'use strict';
  var windows = $('<div>').css('position', 'absolute').appendTo('body')[0];
  var singletons = autoload(plugins, $('body')[0]);
  var menu = $('<div>').css('position', 'fixed').appendTo('body')[0];

  var canvas = [];
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
   } else if (Array.isArray(plugin.desc.size)){
   w.contentSize = plugin.dec.size;
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
    if (singletons.hasOwnProperty('caleydo-links')) {
      singletons['caleydo-links'].remove(vis);
    }
  }

  function addLink(vis) {
    if (singletons.hasOwnProperty('caleydo-links')) {
      singletons['caleydo-links'].push(vis);
    }
  }

  function updateLinks() {
    if (singletons.hasOwnProperty('caleydo-links')) {
      singletons['caleydo-links'].update();
    }
  }

  function addIt(m) {
    var mw = window.create(windows, {
      closeable: true,
      animatedHeader: true,
      zcontrols: true
    });
    var multi = multiform.create(m, mw.node);
    multiform.addIconVisChooser(mw.toolbar, multi);
    mw.title = m.desc.name + ' @ ' + multi.act.name;
    mw.pos = [400, 50];
    mw.contentSize = multi.size;
    multi.on('change', function (event, new_) {
      mw.title = m.desc.name + ' @ ' + new_.name;
      mw.contentSize = multi.size;
    });
    var vis = mw.adapter(multi);
    mw.on('removed', function () {
      removeLink(vis);
      multi.destroy();
      canvas.splice(C.indexOf(canvas, function (c) {
        return c.mw === mw;
      }), 1);
    });
    mw.on('drag_stop', updateLinks);
    addLink(vis);
    var entry = {
      mw: mw,
      multi: multi
    };
    canvas.push(entry);
    return entry;
  }

  function persist() {
    return {
      canvas: canvas.map(function (e) {
        return {
          data : e.multi.data.persist(),
          multi: e.multi.persist(),
          mw: e.mw.persist()
        };
      }),
      idtypes: idtypes.persist()
    };
  }

  function restore(persisted) {
    canvas.forEach(function (e) {
      e.mw.close();
    });
    persisted.canvas.forEach(function (e) {
      data.get(e.data).then(function (m) {
        var r = addIt(m);
        r.mw.restore(e.mw);
        r.multi.restore(e.multi);
      });
    });
    idtypes.restore(persisted.idtypes);
  }


  var b = d3.select(menu);
  b.append('span').text('Select Dataset: ');
  var $select = b.append('select').attr('class', 'dataselector');

  b.append('button').text('Clear Selections').on('click', function () {
    idtypes.clearSelection();
  });
  var persisted = [];
  b.append('button').text('Persist').on('click', function () {
    var r = persist();
    console.log(JSON.stringify(r, null, ' '));
    persisted.push(r);
    $restore.attr('disabled', null);
  });
  var $restore = b.append('button').text('Restore').attr('disabled','disabled').on('click', function () {
    if (persisted.length > 0) {
      restore(persisted.pop());
    }
    $restore.attr('disabled', persisted.length > 0 ? null : 'disable');
  });


  data.list().then(function (list) {
    //for all inhomogeneous add them as extra columns, too
    list = d3.entries(list).map(function (e) {
      e.group = '_dataSets';
      return e;
    });
    list.forEach(function (entry) {
      if (entry.value.desc.type === 'table') {
        list.push.apply(list, entry.value.cols().map(function (col) {
          return {
            group: entry.value.desc.name,
            key: col.desc.name,
            value: col
          };
        }));
      }
    });
    list.unshift({group: '_dataSets'});
    var nest = d3.nest().key(function (d) {
      return d.group;
    }).entries(list);
    var $options = $select.selectAll('optgroup').data(nest);
    $options.enter().append('optgroup').attr('label', function (d) {
      return d.key;
    }).each(function (d) {
      var $op = d3.select(this).selectAll('option').data(d.values);
      $op.enter().append('option').text(function (d) {
        return d.value ? d.value.desc.name : '';
      });
    });
    $select.on('change', function () {
      var n = $select.node();
      var i = n.selectedIndex;
      if (i < 0) {
        return;
      }
      var op = n.options[i];
      var d = d3.select(op).data()[0];
      if (d && d.value) {
        addIt(d.value);
      }
      n.selectedIndex = 0;
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
