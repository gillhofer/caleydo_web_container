/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3', '../tooltip/index', '../caleydo', 'css!./style'], function (exports, d3, tooltip, C) {
  function BoxPlot(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  function createText(stats) {
    var r = '<table><tbody>';
    var keys = ['min', 'max', 'sum', 'mean', 'var', 'sd', 'n', 'nans', 'moment2', 'moment3', 'moment4', 'kurtosis', 'skewness'];
    keys.forEach(function (key) {
      var value = stats[key];
      r = r + '<tr><td>' + key + '</td><td>' + value + '</td></tr>';
    });
    r = r + '</tbody></table>';
    return r;
  }

  BoxPlot.prototype.locate = function () {
    if (arguments.length === 1) {
      return this.locateImpl(arguments[0]);
    }
    return C.all(C.argList(arguments).map(this.locateImpl, this));
  };

  BoxPlot.prototype.locateImpl = function (range) {
    var that = this;
    if (range.isAll || range.isNone) {
      var r = this.scale.range();
      return { x: r[0], w: r[1] - r[0], y: 0, h : 50 };
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extent(data, that.scale);
      return { x: ex[0], w: ex[1] - ex[0], y: 0, h : 50 };
    });
  };

  BoxPlot.prototype.build = function ($parent) {
    var h = 50, w = 300;
    var $svg = $parent.append("svg").attr({
      width: w,
      height: h,
      'class': 'box'
    });

    var s = this.scale = d3.scale.linear().range([0, w]).clamp(true);

    $svg.append('path').attr({
      d: 'M0,0 L0,$ M0,§ L%,§ M%,0 L%,$'.replace(/%/g, w).replace(/\$/g, h).replace(/\§/g, h / 2),
      'class': 'axis'
    });

    this.data.stats().then(function (stats) {
      s.domain([stats.min, stats.max]);

      var text = createText(stats);

      $svg.append('rect').attr({
        x: s(stats.mean - stats.sd),
        y: '10%',
        width: s(stats.sd * 2),
        height: '80%',
        'class': 'box'
      }).call(tooltip.bind(text));

      $svg.append('line').attr({
        x1: s(stats.mean),
        x2: s(stats.mean),
        y1: '10%',
        y2: '90%',
        'class': 'mean'
      });
    });

    return $svg.node();
  };
  exports.BoxPlot = BoxPlot;

  function create(data, parent) {
    return new BoxPlot(data, parent);
  }

  exports.create = create;
});
