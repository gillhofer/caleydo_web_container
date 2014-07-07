/*global $, d3 */
$(function () {
  'use strict';
  d3.json('api/dataset', function (data) {
    var $data = d3.select('#datasets').selectAll('li').data(data);
    $data.enter()
      .append('li')
      .each(function (d) {
        d3.select(this).append('a')
          .text(d.name)
          .attr('href', '#')
          .on('click', function (d) {
            d3.json('api/dataset/'  + d.id, function (file) {
              console.log(file);
            });
          });
        var d2 = d3.select(this).append('table').selectAll('tr').data(d3.entries(d));
        d2.enter()
          .append('tr').each(function (d) {
            var row = d3.select(this);
            row.append('td').text(d.key);
            row.append('td').text(JSON.stringify(d.value));
          });
        d2.exit().remove();
      });

    $data.exit().remove();
  });
});