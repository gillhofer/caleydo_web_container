/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', 'd3.parcoords', '../caleydo/main'], function (exports, d3, d3_parcoords, C) {
  exports.ParCo = d3utils.defineVis('ParCo', {
    margin: { top: 24, right: 0, bottom: 12, left: 0 }
  }, [360, 150], function build($parent, data, size) {
    var that = this;
    var $base = $parent.append('div').classed('parcoords', true).style({
      width: size[0] + 'px',
      height: size[1] + 'px'
    });

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
      that.markReady();
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
      var bak = {
        scale: this.options.scale || [1, 1],
        rotate: this.options.rotate || 0
      };
      if (arguments.length === 0) {
        return bak;
      }
      var s = this.rawSize();
      this.$node.style({
        transform: 'rotate(' + rotate + 'deg)scale(' + scale[0] + ',' + scale[1] + ')',
        width: s[0] * scale[0] + 'px',
        height: s[1] * scale[1] + 'px'
      });
      var new_ = {
        scale: scale,
        rotate: rotate
      };
      this.fire('transform', new_, bak);

      this.options.scale = scale;
      this.options.rotate = rotate;
      return new_;
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
