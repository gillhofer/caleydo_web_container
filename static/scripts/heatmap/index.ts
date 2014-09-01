/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />

import d3 = require('d3');
import matrix = require('../caleydo-matrix');
import C = require('../caleydo');

export class HeatMap {
  node: Element;

  constructor(public data : matrix.IMatrix, public parent: Element) {
    this.node = this.build(d3.select(parent));
  }

  private build($parent : D3.Selection) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    var $svg = $parent.append('svg').attr({
      width: width * 10 + "px",
      height: height * 10 + "px"
    });

    var colScale = d3.scale.linear().domain([0, width]).range([0, 100]);
    var rowScale = d3.scale.linear().domain([0, height]).range([0, 100]);
    var c = d3.scale.linear().domain([0, 1]).range(["black", "white"]);
    this.data.data().then((arr) => {
      var $rows = $svg.selectAll("g").data(arr);
      $rows.enter().append("g");
      $rows.each(function (row, i) {
        var $cols = d3.select(this).selectAll("rect").data(row);
        $cols.enter().append("rect").append("title").text(C.identity);
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
    });
    return $svg.node();
  }
}

export function create(data : matrix.IMatrix, parent : Element)  {
  return new HeatMap(data, parent);
}