/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/d3util', '../caleydo-tooltip/main', 'css!./style'], function (exports, d3, C, utils, tooltip) {

  function Vis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      radius: 100,
      innerRadius: 0
    }, options);
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  Vis.prototype.locate = function (range) {
    if (arguments.length === 1) {
      return this.locateImpl(range);
    }
    return C.all(C.argList(arguments).map(this.locateImpl, this));
  };

  Vis.prototype.locateImpl = function (range) {
    var that = this, o = this.options;
    if (range.isAll || range.isNone) {
      return C.resolved({ x: o.radius, y: o.radius, radius: o.radius});
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extent(data, function (value) {
        return that.hist.binOf(value);
      });
      //FIXME
      return that.wrap({ x: o.radius, y: o.radius, radius: o.radius});
    });
  };

  Vis.prototype.build = function ($parent) {
    var o = this.options, that = this;
    var $svg = $parent.append("svg").attr({
      width: o.radius * 2,
      height: o.radius * 2,
      'class': 'pie'
    });
    var $base = $svg.append('g').attr('transform', 'translate(' + o.radius + ',' + o.radius + ')');

    var scale = that.scale = d3.scale.linear().range([0, 2 * Math.PI]);
    var arc = d3.svg.arc().innerRadius(o.innerRadius).outerRadius(o.radius)
      .startAngle(function (d) {
        return scale(d.start);
      })
      .endAngle(function (d) {
        return scale(d.end);
      });
    var cols = d3.scale.category10();

    this.data.hist().then(function (hist) {
      that.hist = hist;
      scale.domain([0, hist.count]);
      var data = that.hist_data = [], prev = 0, cats = that.data.desc.value.categories;
      hist.forEach(function (b, i) {
        data[i] = {
          name: ( typeof cats[i] === 'string') ? cats[i] : cats[i].name,
          start: prev,
          end: prev + b,
          color: ( typeof cats[i].color === 'undefined') ? cols(i) : cats[i].color
        };
        prev += b;
      });
      var $m = $base.selectAll('path').data(data);
      $m.enter().append('path').call(tooltip.bind(function (d) {
        return d.name;
      }));
      $m.attr('d', arc).attr('fill', function (d) {
        return d.color;
      });
    });

    return $svg.node();
  };
  exports.Pie = Vis;

  function create(data, parent, options) {
    return new Vis(data, parent, options);
  }

  exports.create = create;
});
