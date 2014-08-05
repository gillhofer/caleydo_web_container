/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path='../../../../tsd.d.ts' />

import d3 = require('d3');
import matrix = require('../caleydo-matrix');
import plugins = require('../caleydo-plugins');
import C = require('../caleydo');

export class Table implements plugins.IVisualization {
  constructor(public data : matrix.IMatrix, public parent: Element) {
    this.build(d3.select(parent));
  }

  private build($parent : D3.Selection) {
    var $table = $parent.append('table');
    $table.append('thead').append('tr');
    $table.append('tbody');
    C.all([this.data.cols(),this.data.rows(), this.data.data()]).then((arr) => {
      var cols = arr[0], rows = arr[1], d = arr[2];
      var $headers = $table.select('thead tr').selectAll('th').data(['ID'].concat(cols));
      $headers.enter().append('th');
      $headers.text(C.identity);
      $headers.exit().remove();

      var $rows = $table.select('tbody').selectAll('tr').data(d);
      $rows.enter().append('tr');
      $rows.each(function (row, i) {
        var $header = d3.select(this).selectAll('th').data(rows.slice(i, i+1));
        $header.enter().append('th');
        $header.text(C.identity);
        $header.exit().remove();
        var $row = d3.select(this).selectAll('td').data(row);
        $row.enter().append('td');
        $row.text(C.identity);
        $row.exit().remove();
      });
      $rows.exit().remove();
    });
  }
}

export function create(data : matrix.IMatrix, parent : Element)  {
  return new Table(data, parent);
}