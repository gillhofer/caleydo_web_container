/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo', 'css!./style'], function (exports, d3, C) {
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

  Axis.prototype.build = function ($parent) {
    var h = 300, w = 50, shift = 10, o = this.options;
    var $svg = $parent.append("svg").attr({
      width: w,
      height: h,
      'class': 'axis'
    });
    var $points = $svg.append('g');
    var $axis = $svg.append('g');
    var s = d3.scale.linear().domain(this.data.desc.value.range).range([shift, ((o.orient === 'left' || o.orient === 'right') ? h : w) - shift]).clamp(true);
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
    var cxy = (o.orient === 'left' || o.orient === 'right') ? 'cy' : 'cx';
    this.data.data().then(function (data) {
      var $p = $points.selectAll('circle').data(data);
      $p.enter().append('circle').attr('r', o.r);
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
