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

    var pc = d3_parcoords()($base.node());
    /*, types = {};
    pc.dimensions(this.data.cols().map(function (col) {
      var val = col.desc.value, type;
      switch (val.type) {
      case 'real':
      case 'int':
        type = 'number';
        pc.scale(col.name, val.range);
        break;
      case 'categorical':
        type = 'string';
        pc.scale(col.name, val.categories);
        break;
      default:
        type = 'string';
        break;
      }
      types[col.name] = type;
      return col.name;
    }));
    pc.types(types);*/


    this.data.objects().then(function (arr) {
      pc.data(arr);
      pc.render();
      pc.ticks(3)
        .createAxes();
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
