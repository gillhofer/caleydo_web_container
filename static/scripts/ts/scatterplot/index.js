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
      var $svg = $parent.append('div').attr({
        'class': 'scatterplot',
        id: 'example',
        style: 'width:360px;height:150px'
      });


    };
    return ScatterPlot;
  })();
  exports.ScatterPlot = ScatterPlot;

  function create(data, parent) {
    return new ScatterPlot(data, parent);
  }

  exports.create = create;
});
