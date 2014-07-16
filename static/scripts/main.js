/*global $, d3 */
$(function () {
  'use strict';

  function identity(arg) {
    return arg;
  }

  var loadFile = function (desc, file) {
    var headers = file.cols;
    var $base = d3.select("#file");
    $base.select("caption").text(desc.name);
    var $headers = $base.select("thead tr").selectAll("th").data(headers);
    $headers.enter()
      .append("th");
    $headers.text(identity);
    $headers.exit().remove();

    var $rows = $base.select("tbody").selectAll("tr").data(file.data);
    $rows.enter().append("tr");
    $rows.each(function (row) {
      var $row = d3.select(this).selectAll("td").data(row);
      $row.enter().append("td");
      $row.text(identity);
      $row.exit().remove();
    });
    $rows.exit().remove();
  };

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
              loadFile(d, file);
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