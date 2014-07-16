/*global $, d3 */
$(function () {
  'use strict';

  function identity(arg) {
    return arg;
  }

  function loadTable(desc, file) {
    var $base = d3.select("#filetable").style("display", null);
    d3.select("#fileheatmap").style("display", "none");

    var headers = file.cols;

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
  }

  function loadHeatMap(desc, file) {
    var $svg = d3.select("#fileheatmap").style("display", null);
    d3.select("#filetable").style("display", "none");
    var colScale = d3.scale.linear().domain([0, file.cols.length]).range([0, 100]);
    var rowScale = d3.scale.linear().domain([0, file.rows.length]).range([0, 100]);
    var c = d3.scale.linear().domain([0, 1]).range(["black", "white"]);
    var $rows = $svg.selectAll("g").data(file.data);
    $rows.enter().append("g");
    $rows.each(function (row, i) {
      var $cols = d3.select(this).selectAll("rect").data(row);
      $cols.enter().append("rect");
      $cols.attr({
        fill: function (d) {
          return c(d);
        },
        x: function (d, j) {
          return colScale(j) + "%";
        },
        y: rowScale(i) + "%",
        width: colScale(1) + "%",
        height: rowScale(1) + "%"
      });
      $cols.exit().remove();
    });
    $rows.exit().remove();
  }

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
              if (d.type === 'matrix') {
                loadHeatMap(d, file);
              } else {
                loadTable(d, file);
              }
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