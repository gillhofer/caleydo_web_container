/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo', '../caleydo-d3utils', 'css!./style'], function (exports, d3, C, utils) {
  var h = 300, w = 50, shift = 10;

  function Axis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      tickSize: 2,
      orient: 'left',
      r: 2
    }, options);
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  Axis.prototype.locate = function () {
    if (arguments.length === 1) {
      return this.locateImpl(arguments[0]);
    }
    return C.all(C.argList(arguments).map(this.locateImpl, this));
  };

  Axis.prototype.locateImpl = function (range) {
    var that = this;
    if (range.isAll || range.isNone) {
      var r = this.scale.range();
      return that.wrap({ y: r[0], h: r[1] - r[0] });
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extend(data, that.scale);
      return that.wrap({ y: ex[0], h: ex[1] - ex[0] });
    });
  };

  Axis.prototype.wrap = function (base) {
    switch (this.options.orient) {
    case 'left':
      base.x = w - shift;
      base.w = 0;
      break;
    case 'right':
      base.x = shift;
      base.w = 0;
      break;
    case 'top':
      base.x = base.y;
      base.w = base.h;
      base.y = shift;
      base.h = 0;
      break;
    case 'bottom':
      base.x = base.y;
      base.w = base.h;
      base.y = h - shift;
      base.h = 0;
      break;
    }
    base.x -= this.options.r;
    base.y -= this.options.r;
    base.w += 2 * this.options.r;
    base.h += 2 * this.options.r;
    return base;
  };

  Axis.prototype.build = function ($parent) {
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
  exports.Axis = Axis;

  function create(data, parent, options) {
    return new Axis(data, parent, options);
  }

  exports.create = create;
});
