/**
 * Created by Marc Streit on 15.08.2014.
 */
define(['exports', 'd3', '../caleydo', 'css!./links_style'], function (exports, d3, C) {
  var LinksRenderer = (function () {
    function LinksRenderer(parent) {
      this.parent = parent;
      this.build(d3.select(parent));
    }

    LinksRenderer.prototype.build = function ($parent) {

      var div = $parent.append('div').attr({
        'class': 'layer layer1'
      });

      var svg = div.append("svg").attr({
        style: 'width:100%;height:100%'
      });

      svg.append('circle')
        .attr({
          'class': 'circle',
          'id': 'layer1'
        })
        .attr("fill", "black")
        .attr("cx", 60)
        .attr("cy", 500)
        .attr("r", 50)
        .on("mouseover", function (d, i) {
          d3.select(this).attr("fill", "red");
        })
        .on("mouseout", function (d, i) {
          d3.select(this).attr("fill", "black");
        });
    };
    return LinksRenderer;
  })();
  exports.LinksRenderer = LinksRenderer;

  function create(parent) {
    return new LinksRenderer(parent);
  }

  exports.create = create;
});
