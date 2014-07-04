'use strict';

$(function() {
  d3.json("api/dataset", function(data) {
    var $data = d3.select("#datasets").selectAll("li").data(data);
    $data.enter()
      .append("li")
      .text(function(d) {
        return d.name;
      });
    $data.exit().remove();
  })
});