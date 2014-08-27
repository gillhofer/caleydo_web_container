/**
 * Created by Samuel Gratzl on 05.08.2014.
 */

define(['exports', 'd3', 'css!./style'], function (exports, d3) {
  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function bind(toLabel) {
    return function (selection) {
      selection.on({
        'mouseenter': function (d, i) {
          tooltip
            .html(toLabel.call(this,d,i))
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          tooltip.transition()
            .delay(200)
            .duration(200)
            .style("opacity", .9);
        },
        'mouseleave': function (d, i) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        }
      });
    };
  }

  exports.bind = bind;
});
