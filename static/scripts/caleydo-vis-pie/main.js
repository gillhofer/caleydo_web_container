/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/d3util', 'css!./style'], function (exports, d3, C, utils) {

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
      'class': 'pie',
      transform: 'translate(' + o.radius + ',' + o.radius + ')'
    });

    var scale = that.scale = d3.scale.linear().range([0, 2 * Math.PI]);
    var col = d3.scale.category10();
    var arc = d3.svg.arc().innerRadius(o.innerRadius).outerRadius(o.radius)
      .startAngle(function (d) {
        return scale(d.start);
      })
      .endAngle(function (d) {
        return scale(d.end);
      });

    this.data.hist().then(function (hist) {
      that.hist = hist;
      scale.domain([0, hist.count]);
      var data = that.data = [], prev = 0;
      hist.forEach(function (b, i) {
        data[i] = {
          start: prev,
          end: prev + b
        };
        prev += b;
      });
      var $m = $svg.selectAll('path').data(data);
      $m.enter().append('path');
      $m.attr('d', arc).attr('fill', function (d, i) {
        return col(i);
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
