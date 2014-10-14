/**
 * Created by Samuel Gratzl on 05.08.2014.
 */

/**
 * a tooltip module, providing a single method: 'bind'
 */
define(['exports', 'd3', 'css!./style'], function (exports, d3) {
  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  /**
   * returns a D3 compatible call method, which registers itself to show a tooltip upon mouse enter
   * @param toLabel the text to show or a function to determine the text to show
   * @returns {Function}
   */
  function bind(toLabel) {
    //wrap as function
    toLabel = d3.functor(toLabel);

    return function (selection) {
      selection.on({
        mouseenter: function (d, i) {
          tooltip
            .html(toLabel.call(this, d, i))
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          tooltip.transition()
            .delay(200)
            .duration(200)
            .style("opacity", 0.9);
        },
        mouseleave: function () {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        }
      });
    };
  }

  exports.bind = bind;
});
