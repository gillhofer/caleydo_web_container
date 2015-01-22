/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/d3util', 'css!./style'], function (exports, d3, C, utils) {
  exports.Dummy = utils.defineVis('Axis', {
    width: 500,
    height: 100,
    tickSize: 3,
    barPadding: 2,
    axisPadding: 30
  }, function ($parent) {
    var o = this.options;
    var barPadding = o.barPadding;
    var padding = o.axisPadding;
    var plotWidth = o.width - padding;

    var svg = $parent.append("svg")
      .attr("width", o.width)
      .attr("height", o.height);


    var yScale = this.yScale = d3.scale.linear().domain(this.data.desc.value.range).range([o.height, 0]);

    var axis = d3.svg.axis().
      scale(yScale).
      orient("right")
      .ticks(o.tickSize);

    var supergroup = svg.append("g");

    supergroup.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + plotWidth + ", 0)")
      .call(axis);

    var bars = supergroup.append("g")
      .attr("class", "bar");
    var labels = supergroup.append("g")
      .attr("class", "label");

    var onClick = utils.selectionUtil(this.data, bars, "rect");

    this.data.data().then(function (data) {

      bars.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
          return i * (plotWidth / data.length);
        })
        .attr("y", function (d) {
          return yScale(d);
        })
        .attr("width", plotWidth / data.length - barPadding)
        .attr("height", function (d) {
          return o.height - yScale(d);
        })
        .attr("fill", function (d) {
          return "rgb(0,0," + (d * 10) + ")";
        })
        .on('click', onClick);

      var tt = labels.selectAll("text").data(data);
      tt.enter()
        .append("text")
        .attr("y", function (d) {
          return 50;//(yScale(d)) + 15;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "red")
        .attr("text-anchor", "middle");
      tt.text(function (d) {
        return d;
      }).attr("x", function (d, i) {
        return i * (plotWidth / data.length)+ (plotWidth / data.length - barPadding) / 2;
      });
      tt.exit().remove();

    });

    return svg;
  }, {
    locateIt : function (range) {
      var that = this;
      if (range.isAll || range.isNone) {
        return C.resolved({ x: 0, y: 0, w: this.options.width, h: this.options.height});
      }
      return this.data.data().then(function (data) {

        var i = d3.extent(range.dim(0).iter().asList());
        var minMaxY = d3.extent([data[i[0]]], that.yScale);

        var plotWidth = that.options.width - that.options.axisPadding;
        var barPadding = that.options.barPadding;

        var posX = i[0] * (plotWidth / data.length);
        var width = plotWidth / data.length - barPadding;
        return { x: posX, y: minMaxY[0], w: width, h: that.yScale([data[i[0]]]) };
      });
    }

  });


  function create(data, parent, options) {
    return new exports.Dummy(data, parent, options);
  }

  exports.create = create;
});
