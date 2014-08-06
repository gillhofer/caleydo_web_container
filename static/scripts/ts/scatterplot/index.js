/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3','../caleydo'], function (exports, d3, C) {
  var ScatterPlot = (function () {
    function ScatterPlot(data, parent) {
      this.data = data;
      this.parent = parent;
      this.build(d3.select(parent));
    }

    ScatterPlot.prototype.build = function ($parent) {
      var dims = this.data.dim;
      var width = dims[1], height = dims[0];
      var $svg = $parent.append('div').append("svg").attr({
        'class': 'scatterplot',
        id: 'example',
        style: 'width:360px;height:150px'
      });

var test = $svg.selectAll(".test").data([1,2,3]);
test.exit().remove();

// --- adding Element to class test
var testEnter = test.enter().append("circle").attr({
    "class":"test"
})

// --- changing nodes for test
test.attr({
    cx: 5,
    cy: function (d,i) {
      return i*10+5+d*2;
    },
    r:5
})
    };
    return ScatterPlot;
  })();
  exports.ScatterPlot = ScatterPlot;

  function create(data, parent) {
    return new ScatterPlot(data, parent);
  }

  exports.create = create;
});
