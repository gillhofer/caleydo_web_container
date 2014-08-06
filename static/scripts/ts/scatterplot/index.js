/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3', '../caleydo'], function (exports, d3, C) {
  var ScatterPlot = (function () {
    function ScatterPlot(data, parent) {
      this.data = data;
      this.parent = parent;
      this.build(d3.select(parent));
    }

    ScatterPlot.prototype.build = function ($parent) {
      var dims = this.data.dim;
      var width = 200, height = 200;
      var div = $parent.append('div');

      var xcol = 0;
      var ycol = 1;

      var svg = div.append("svg").attr({
        'class': 'scatterplot',
        id: 'example',
        style: 'width:360px;height:150px'
      });

      that = this;

      // bind data to chart
      this.data.data().then(function (arr) {

        // create scales
        var x = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
            return d[xcol]
          }))]).range([0, width]),
          y = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
            return d[ycol]
          }))]).range([height, 0]);

        svg.selectAll('circle')
          .data(arr)
          .enter().append('circle')
          .attr("fill", "black")
          .attr("cx", function (d) {
            return x(d[xcol]);
          })
          .attr("cy", function (d) {
            return y(d[ycol]);
          })
          .attr("r", 2);
        //.on("mouseover", function(d) {
        //  d3.select('#hover-food').text(d.name.substr(0,50));
        //});
      });

      div.append("select").attr("id", "xaxis-selection");
      div.append("select").attr("id", "yaxis-selection");

      this.data.cols().then(function (cols) {
        d3.select("#xaxis-selection").selectAll("option").data(cols).enter().append("option").attr("value", function (d, i) {
          return i;
        })
          .text(function (d) {
            return d;
          })
          .each(function (d, i) {
            if (i == xcol) d3.select(this).attr("selected", "yes");
          });

        d3.select("#xaxis-selection")
          .on("change", function() {
            xcol = this.selectedIndex;
            update()
          });

        d3.select("#yaxis-selection").selectAll("option").data(cols).enter().append("option").attr("value", function (d, i) {
          return i;
        })
          .text(function (d) {
            return d;
          })
          .each(function (d, i) {
            if (i == ycol) d3.select(this).attr("selected", "yes");
          });

        d3.select("#yaxis-selection")
          .on("change", function() {
            ycol = this.selectedIndex;
            update()
          });
      })

      function update() {

        that.data.data().then(function (arr) {

          // create scales
          var x = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
              return d[xcol]
            }))]).range([0, width]),
            y = d3.scale.linear().domain([0, d3.max(arr.map(function (d) {
              return d[ycol]
            }))]).range([height, 0]);

          svg.selectAll('circle')
            .transition()
            .ease('linear')
            .duration(1000)
            .attr("cx", function (d) {
              return x(d[xcol]);
            })
            .attr("cy", function (d) {
              return y(d[ycol]);
            })
        })
      };
    };
    return ScatterPlot;
  })();
  exports.ScatterPlot = ScatterPlot;

  function create(data, parent) {
    return new ScatterPlot(data, parent);
  }

  exports.create = create;
});
