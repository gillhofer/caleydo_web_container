/**
 * Created by Samuel Gratzl on 24.11.2014.
 */
/* global define */
"use strict"

define(['exports', 'd3', '../caleydo/main', '../caleydo/idtype', '../caleydo/geom', 'css!./style'], function (exports, d3, C, idtypes, geom) {
  function BarPlotVis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      width: 100,
      heighti : 10,
      cssClass: '',
      min: 0,
      max: NaN
    }, options);
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  BarPlotVis.prototype.locate = function (range) {
    if (arguments.length === 1) {
      return this.locateImpl(range);
    }
    return C.all(C.argList(arguments).map(this.locateImpl, this));
  };

  BarPlotVis.prototype.locateImpl = function (range) {
    var o = this.options, that = this;
    var ex_i =  d3.extent(range.dim(0).iter().asList());

    return this.data.data(range).then(function (data) {
      var ex_v = d3.extent(data);
      return geom.rect(
        that.xscale(ex_v[0]) / 100.0 * o.width,
        ex_i[0] * o.heighti,
        that.xscale(ex_v[1]) / 100.0 * o.width,
        (ex_i[1] + 1) * o.heighti
      );
    });
  };

  BarPlotVis.prototype.build = function ($parent) {
    var o = this.options, that = this, data = this.data, len = data.length;
    var $svg = $parent.append('svg').attr({
      width: o.width,
      height: len * o.heighti,
      'class': 'barplot ' + o.cssClass
    });

    //using range bands with an ordinal scale for uniform distribution
    var xscale = that.xscale = d3.scale.linear().range([0, 100]);
    var yscale = that.yscale = d3.scale.linear().range([0, 100]);

    var onClick = function (d, i) {
      data.select(0, [i], idtypes.toSelectOperation(d3.event));
    };

    var l = function (event, type, selected) {
      $svg.selectAll('rect').classed('select-' + type, false);
      if (selected.isNone) {
        return;
      }
      var dim0 = selected.dim(0);
      if (selected.isAll) {
        $svg.selectAll('rect').classed('select-' + type, true);
      } else {
        dim0.forEach(function (j) {
          $svg.selectAll('rect:nth-child(' + (j + 1) + ')').classed('select-' + type, true);
        });
      }
    };
    data.on('select', l);
    C.onDOMNodeRemoved($svg.node(), function () {
      data.off('select', l);
    });

    this.data.data().then(function (_data) {
      yscale.domain([0, data.length]);
      if (isNaN(o.min) || isNaN(o.max)) {
        var minmax = d3.extent(_data);
        if (isNaN(o.min)) {
          o.min = minmax[0];
        }
        if (isNaN(o.max)) {
          o.max = minmax[1];
        }
      }
      xscale.domain([o.min, o.max]);

      var $m = $svg.selectAll('rect').data(_data);
      $m.enter().append('rect')
        .on('click', onClick);
      $m.attr({
        y: function (d, i) {
          return yscale(i);
        },
        height: function (d) {
          return yscale(1);
        },
        width: function (d) {
          return xscale(d);
        }
      });
      data.selections().then(function (selected) {
        l(null, 'selected', selected);
      });
    });

    return $svg.node();
  };

  exports.BarPlot = BarPlotVis;

  exports.create = function createBarPlot(data, parent, options) {
    return new BarPlotVis(data, parent, options);
  };
});
