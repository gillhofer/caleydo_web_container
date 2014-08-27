/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3', '../caleydo', '../tooltip/index', 'css!./style'], function (exports, d3, C, tooltip) {
  var ScatterPlot = (function () {
    function ScatterPlot(data, parent) {
      this.data = data;
      this.parent = parent;
      this.build(d3.select(parent));
    }

    ScatterPlot.prototype.build = function ($parent) {
      var width = 100, height = 100;

      var xcol = 0;
      var ycol = 1;

      var svg = $parent.append("svg").attr({
        width: 360,
        height: 150
      });

      var that = this;

      // bind data to chart
      C.all([this.data.data(), this.data.rows()]).then(function (promise) {

        var arr = promise[0];
        var rowNames = promise[1];

        // create scales
        var x = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
            return d[xcol];
          }))]).range([0, width]),
          y = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
            return d[ycol];
          }))]).range([height, 0]);

        svg.selectAll('circle')
          .data(arr)
          .enter().append('circle')
          .attr("cx", function (d) {
            return x(d[xcol]);
          })
          .attr("cy", function (d) {
            return y(d[ycol]);
          })
          .attr("r", 2)
          .call(tooltip.bind(function (d, i) {
            return rowNames[i];
          }));
      });

      var $xaxis = $parent.append("select");
      var $yaxis = $parent.append("select");


      function update() {
        that.data.data().then(function (arr) {

          // create scales
          var x = d3.scale.linear().domain([0, d3.max(arr, function (d) {
              return d[xcol];
            })]).range([0, width]),
            y = d3.scale.linear().domain([0, d3.max(function (d) {
              return d[ycol];
            })]).range([height, 0]);

          svg.selectAll('circle')
            .transition()
            .ease('linear')
            .duration(1000)
            .attr("cx", function (d) {
              return x(d[xcol]);
            })
            .attr("cy", function (d) {
              return y(d[ycol]);
            });
        });
      }
      this.data.cols().then(function (cols) {
        $xaxis.selectAll("option").data(cols).enter()
          .append("option")
          .attr("value", function (d, i) {
            return i;
          })
          .text(C.identity)
          .each(function (d, i) {
            if (i == xcol) {
              d3.select(this).attr("selected", "selected");
            }
          })
          .on("change", function () {
            xcol = this.selectedIndex;
            update();
          });

        $yaxis.selectAll("option").data(cols)
          .enter()
          .append("option")
          .attr("value", function (d, i) {
            return i;
          })
          .text(C.identity)
          .each(function (d, i) {
            if (i == ycol) {
              d3.select(this).attr("selected", "selected");
            }
          })
          .on("change", function () {
            ycol = this.selectedIndex;
            update();
          });
      });
    };
    return ScatterPlot;
  }());
  exports.ScatterPlot = ScatterPlot;

  function create(data, parent) {
    return new ScatterPlot(data, parent);
  }

  exports.create = create;
});
