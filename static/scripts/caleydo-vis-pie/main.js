/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/d3util', 'css!./style'], function (exports, d3, C, utils) {
  var h = 200, w = 200;

  function Vis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      tickSize: 2,
      orient: 'left',
      r: 2
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
    var that = this;
    if (range.isAll || range.isNone) {
      var r = this.scale.range();
      return C.resolved(that.wrap({ y: r[0], h: r[1] - r[0] }));
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extent(data, that.scale);
      return that.wrap({ y: ex[0], h: ex[1] - ex[0] });
    });
  };

  Vis.prototype.build = function ($parent) {
    var o = this.options;
    var $svg = $parent.append("svg").attr({
      width: w,
      height: h,
      'class': 'axis'
    });
    var $axis = $svg.append('g').attr('class', 'makeover');
    var $points = $svg.append('g');
    var s = this.scale = d3.scale.linear().domain(this.data.desc.value.range).range([shift, ((o.orient === 'left' || o.orient === 'right') ? h : w) - shift]).clamp(true);
    var axis = d3.svg.axis()
      .tickSize(o.tickSize)
      .orient(o.orient)
      .scale(s);

    switch (o.orient) {
    case 'left':
      $points.attr('transform', 'translate(' + (w - shift) + ',0)');
      $axis.attr('transform', 'translate(' + (w - shift) + ',0)');
      break;
    case 'right':
      $points.attr('transform', 'translate(' + shift + ',0)');
      $axis.attr('transform', 'translate(' + shift + ',0)');
      break;
    case 'top':
      $points.attr('transform', 'translate(0, ' + shift + ')');
      $axis.attr('transform', 'translate(0,' + shift + ')');
      break;
    case 'bottom':
      $points.attr('transform', 'translate(0, ' + (h - shift) + ')');
      $axis.attr('transform', 'translate(0,' + (h - shift) + ')');
      break;
    }
    $axis.call(axis);

    var onClick = utils.selectionUtil(this.data, $points, 'circle');

    var cxy = (o.orient === 'left' || o.orient === 'right') ? 'cy' : 'cx';
    this.data.data().then(function (data) {
      var $p = $points.selectAll('circle').data(data);
      $p.enter().append('circle').attr('r', o.r).on('click', onClick);
      $p.exit().remove();
      $p.attr(cxy, function (d) {
        return s(d);
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
