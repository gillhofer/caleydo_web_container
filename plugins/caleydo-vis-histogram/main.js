/**
 * Created by Samuel Gratzl on 13.10.2014.
 */
/* global define */
"use strict";

define(['exports', 'd3', '../caleydo/main', '../caleydo/idtype', '../caleydo-tooltip/main', '../caleydo/d3util'], function (exports, d3, C, idtypes, tooltip, d3utils) {

  function createCategoricalHistData(hist, categories) {
    var data = [],
      cols = d3.scale.category10(),
      total = hist.count,
      acc = 0;
    hist.forEach(function (b, i) {
      data[i] = {
        v: b,
        acc : acc,
        ratio: b / total,
        range: hist.range(i),

        name: (typeof categories[i] === 'string') ? categories[i] : categories[i].name,
        color: (categories[i].color === undefined) ? cols(i) : categories[i].color
      };
      acc += b;
    });
    return data;
  }

  function createNumericalHistData(hist, range) {
    var data = [],
      cols = d3.scale.linear().domain(range).range(['#111111', '#999999']),
      total = hist.count,
      binWidth = (range[1] - range[0]) / hist.bins,
      acc = 0;
    hist.forEach(function (b, i) {
      data[i] = {
        v: b,
        acc : acc,
        ratio: b / total,
        range: hist.range(i),

        name: 'Bin ' + (i + 1) + ' (center: ' + d3.round((i + 0.5) * binWidth, 2) + ')',
        color: cols((i + 0.5) * binWidth)
      };
      acc += b;
    });
    return data;
  }

  function createHistData(hist, value) {
    if (value.type === 'categorical') {
      return createCategoricalHistData(hist, value.categories);
    }
    return createNumericalHistData(hist, value.range);
  }

  exports.Histogram = d3utils.defineVis('HistogramVis', function (data) {
    return {
      nbins: Math.round(Math.sqrt(data.length)),
      totalHeight: true
    };
  }, [200, 100], function ($parent, data, size) {
    var o = this.options, that = this;
    var $svg = $parent.append('svg').attr({
      width: size[0],
      height: size[1],
      'class': 'histogram'
    });
    var $t = $svg.append('g');
    var $data = $t.append('g');
    var $highlight = $t.append('g').style('pointer-events', 'none').classed('select-selected', true);

    //using range bands with an ordinal scale for uniform distribution
    var xscale = that.xscale = d3.scale.ordinal().rangeBands([0, size[0]], 0.1);
    var yscale = that.yscale = d3.scale.linear().range([0, size[1]]);

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
        fill: function (d) {
          return d.color;
        },
        y: function (d) {
          return yscale(yscale.domain()[1] - d.v);
        },
        height: function (d) {
          return yscale(d.v);
        }
      });
      data.selections().then(function (selected) {
        l(null, 'selected', selected);
      });
    });

    return $svg;
  }, {
    locateImpl: function (range) {
      var that = this, size = this.rawSize;
      if (range.isAll || range.isNone) {
        return C.resolved({x: 0, y: 0, w: size[0], h: size[1]});
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
    }
  });

  exports.Mosaic = d3utils.defineVis('MosaicVis', {
    width: 20,
    initialScale: 10
  }, function (data) {
    return [this.options.width, data.dim[0]];
  }, function ($parent, data, size) {
    var o = this.options, that = this;
    var $svg = $parent.append('svg').attr({
      width: size[0],
      height: size[1],
      'class': 'mosaic'
    });
    var $data = $svg.append('g');
    var $highlight = $svg.append('g').style('pointer-events', 'none').classed('select-selected', true);

    //using range bands with an ordinal scale for uniform distribution
    var yscale = that.yscale = d3.scale.linear().range([0, size[1]]);

    var l = function (event, type, selected) {
      var highlights = that.hist_data.map(function (entry, i) {
        var s = entry.range.intersect(selected);
        return {
          i: i,
          acc: entry.acc,
          v: s.size()[0]
        };
      }).filter(function (entry) {
        return entry.v > 0;
      });
      var $m = $highlight.selectAll('rect').data(highlights);
      $m.enter().append('rect').attr('width', '100%');
      $m.attr({
        y: function (d) {
          return yscale(d.acc);
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
      yscale.domain([0, hist.count]);
      var hist_data = that.hist_data = createHistData(hist, data.desc.value);

      var $m = $data.selectAll('rect').data(hist_data);
      $m.enter().append('rect')
        .attr('width', '100%')
        .call(tooltip.bind(function (d) {
          return d.name + ' ' + (d.v) + ' entries (' + Math.round(d.ratio * 100) + '%)';
        }))
        .on('click', onClick);
      $m.attr({
        y: function (d) {
          return yscale(d.acc);
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

    return $svg;
  }, {
    init: function () {
      this.options.scale = [1, this.options.initialScale];
    },
    locateIt: function locateIt(range) {
      var that = this;
      if (range.isAll || range.isNone) {
        return C.resolved({x: 0, y: 0, w: this.rawSize[0], h: this.data.length});
      }
      return this.data.data(range).then(function (data) {
        var ex = d3.extent(data, function (value) {
          return that.hist.binOf(value);
        });
        var h0 = that.hist_data[ex[0]];
        var h1 = that.hist_data[ex[1]];
        return C.resolved({
          x: 0,
          width: this.rawSize[0],
          height: that.yscale(Math.max(h0.v, h1.v)),
          y: that.yscale(that.yscale.domain()[1] - Math.max(h0.v, h1.v))
        });
      });
    }
  });

  exports.create = function createHistogram(data, parent, options) {
    return new exports.Histogram(data, parent, options);
  };
  exports.createMosaic = function createMosaic(data, parent, options) {
    return new exports.Mosaic(data, parent, options);
  };
});
