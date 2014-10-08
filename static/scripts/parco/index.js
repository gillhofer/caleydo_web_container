/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', 'd3.parcoords', '../caleydo'], function (exports, d3, d3_parcoords, C) {
  function ParCo(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  ParCo.prototype.build = function ($parent) {
    var $base = $parent.append('div').attr({
      'class': 'parcoords',
      style: 'width:360px;height:150px'
    }), data = this.data;

    var pc = d3_parcoords()($base.node()), types = {},
      dims;
    dims = this.data.cols().map(function (col) {
      var val = col.desc.value, type;
      switch (val.type) {
      case 'real':
      case 'int':
        type = 'number';
        //pc.scale(col.name, val.range);
        break;
      case 'categorical':
        type = 'string';
        //pc.scale(col.name, val.categories);
        break;
      default:
        type = 'string';
        break;
      }
      types[col.desc.name] = type;
      return col.desc.name;
    });
    pc.types(types).dimensions(dims);

    pc.on('brush', function (brushed) {
      var ori = pc.data();
      //clear selection if all or none are selected
      if (brushed.length === ori.length || brushed.length === 0) {
        data.clear();
      } else {
        //select subset
        var indices = brushed.map(function (row) {
          return row._i;
        });
        data.select(0, indices);
      }
    });

    pc.ticks(3);

    data.objects().then(function (arr) {
      //zip with index
      pc.data(arr.map(function (row, i) {
        return C.mixin({_i: i}, row);
      }));
      pc.render();
      pc.reorderable();
      pc.brushable();
    });

    var l = function (event, type, selected) {
      var slice = selected.filter(pc.data(), []);
      //highlight selection
      pc.highlight(slice);
    };
    data.on('select', l);
    C.onDOMNodeRemoved($base.node(), function () {
      data.off('select', l);
    });
    data.selections().then(function (selected) {
      l(null, 'selected', selected);
    });

    return $base.node();
  };
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
