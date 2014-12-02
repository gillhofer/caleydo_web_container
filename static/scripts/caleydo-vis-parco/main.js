/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', 'd3.parcoords', '../caleydo/main'], function (exports, d3, d3_parcoords, C) {
  exports.ParCo = d3utils.defineVis('ParCo', {
    margin: { top: 24, right: 0, bottom: 12, left: 0 },
    width: 360,
    height: 150
  }, function build($parent) {
    var $base = $parent.append('div').classed('parcoords', true).style({
      width: this.options.width + 'px',
      height: this.options.height + 'px'
    }), data = this.data;

    var pc = d3_parcoords(this.options)($base.node()), types = {},
      dims;
    this.pc = pc;
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
    this.dims = dims;
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

    return $base;
  }, {
    transform: function (scale, rotate) {
      this.$node.style({
        transform: 'rotate(' + rotate + 'deg)scale(' + scale[0] + ',' + scale[1] + ')',
        width: this.options.width * scale[0] + 'px',
        height: this.options.height * scale[1] + 'px'
      });
      this.fire('transform', {
        scale: scale,
        rotate: rotate
      });
      this.options.scale = scale;
      this.options.rotate = rotate;
    },
    locateIt : function (range) {
      var dim0 = this.dims[0],
        yscale = this.pc.yscale[dim0],
        x = this.pc.xscale(dim0),
        offset = this.options.margin.top;
      if (range.isAll || range.isNone) {
        var r = yscale.range();
        return C.resolved({ x: x, w : 6, y: offset + r[0], h: r[1] - r[0] });
      }
      return this.data.objects(range).then(function (data) {
        var ex = d3.extent(data, function (row) { return yscale(row[dim0]); });
        return { x: x, w: 6, y: offset + ex[0], h: ex[1] - ex[0] };
      });
    }
  });

  function create(data, parent, options) {
    return exports.ParCo(data, parent, options);
  }

  exports.create = create;
});
