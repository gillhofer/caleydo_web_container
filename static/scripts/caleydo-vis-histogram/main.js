/**
 * Created by Samuel Gratzl on 13.10.2014.
 */
/* global define */
"use strict"

define(['exports', 'd3', '../caleydo/main', '../caleydo/idtype', '../caleydo-tooltip/main'], function (exports, d3, C, idtypes, tooltip) {

  function Vis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      width: 200,
      height: 100,
      nbins: Math.round(Math.sqrt(data.length)),
      totalHeight: true
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
      return C.resolved({ x: 0, y: 0, w: o.width, h: o.height});
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extent(data, function (value) {
        return that.hist.binOf(value);
      });
      var h0 = that.hist_data[ex[0]];
      var h1 = that.hist_data[ex[1]];
      return C.resolved({
        x: that.xscale(ex[0]),
        width: (that.xscale(ex[1]) - that.xscale(ex[0]) + that.xscale.rangeBand()),
        height: that.yscale(Math.max(h0.v, h1.v)),
        y: that.yscale(that.yscale.domain()[1] - Math.max(h0.v, h1.v))
      });
    });
  };

  function createCategoricalHistData(hist, categories) {
    var data = [],
      cols = d3.scale.category10(),
      total = hist.count;
    hist.forEach(function (b, i) {
      data[i] = {
        v: b,
        ratio: b / total,
        range: hist.range(i),

        name: (typeof categories[i] === 'string') ? categories[i] : categories[i].name,
        color: (categories[i].color === undefined) ? cols(i) : categories[i].color
      };
    });
    return data;
  }

  function createNumericalHistData(hist, range) {
    var data = [],
      cols = d3.scale.linear().domain(range).range(['#111111', '#999999']),
      total = hist.count,
      binWidth = (range[1] - range[0]) / hist.bins;
    hist.forEach(function (b, i) {
      data[i] = {
        v: b,
        ratio: b / total,
        range: hist.range(i),

        name: 'Bin ' + (i + 1) + ' (center: ' + d3.round((i + 0.5) * binWidth, 2) + ')',
        color: cols((i + 0.5) * binWidth)
      };
    });
    return data;
  }

  function createHistData(hist, value) {
    if (value.type === 'categorical') {
      return createCategoricalHistData(hist, value.categories);
    }
    return createNumericalHistData(hist, value.range);
  }

  Vis.prototype.build = function ($parent) {
    var o = this.options, that = this, data = this.data;
    var $svg = $parent.append('svg').attr({
      width: o.width,
      height: o.height,
      'class': 'histogram'
    });
    var $data = $svg.append('g');
    var $highlight = $svg.append('g').style('pointer-events', 'none').classed('select-selected', true);

    //using range bands with an ordinal scale for uniform distribution
    var xscale = that.xscale = d3.scale.ordinal().rangeBands([0, o.width], 0.1);
    var yscale = that.yscale = d3.scale.linear().range([0, o.height]);

    var l = function (event, type, selected) {
      var highlights = that.hist_data.map(function (entry, i) {
        var s = entry.range.intersect(selected);
        return {
          i: i,
          v: s.size()[0]
        };
      }).filter(function (entry) {
        return entry.v > 0;
      });
      var $m = $highlight.selectAll('rect').data(highlights);
      $m.enter().append('rect').attr('width', xscale.rangeBand());
      $m.attr({
        x: function (d) {
          return xscale(d.i);
        },
        y: function (d) {
          return yscale(yscale.domain()[1] - d.v);
        },
        height: function (d) {
          return yscale(d.v);
        }
      });
      $m.exit().remove();
    };
    data.on('select', l);
    C.onDOMNodeRemoved($data.node(), function () {
      data.off('select', l);
    });

    var onClick = function (d) {
      data.select(0, d.range, idtypes.toSelectOperation(d3.event));
    };

    this.data.hist(o.nbins).then(function (hist) {
      that.hist = hist;
      xscale.domain(Array.apply(null, {length: hist.bins}).map(Number.call, Number));
      yscale.domain([0, o.totalHeight ? hist.count : hist.largestFrequency]);
      var hist_data = that.hist_data = createHistData(hist, that.data.desc.value);

      var $m = $data.selectAll('rect').data(hist_data);
      $m.enter().append('rect')
        .attr('width', xscale.rangeBand())
        .call(tooltip.bind(function (d) {
          return d.name + ' ' + (d.v) + ' entries (' + Math.round(d.ratio * 100) + '%)';
        }))
        .on('click', onClick);
      $m.attr({
        x: function (d, i) {
          return xscale(i);
        },
        y: function (d) {
          return yscale(yscale.domain()[1] - d.v);
        },
        height: function (d) {
          return yscale(d.v);
        },
        fill: function (d) {
          return d.color;
        }
      });
      data.selections().then(function (selected) {
        l(null, 'selected', selected);
      });
    });

    return $svg.node();
  };
  exports.Histogram = Vis;

  function create(data, parent, options) {
    return new Vis(data, parent, options);
  }

  exports.create = create;
})
;
