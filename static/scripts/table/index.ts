/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path='../../../tsd.d.ts' />

import d3 = require('d3');
import matrix = require('../caleydo-matrix');
import table = require('../caleydo-table');
import vector = require('../caleydo-vector');
import datatypes = require('../caleydo-datatype');
import C = require('../caleydo');

export class Table {
  constructor(public data:any, public parent:Element) {
    var $p = d3.select(parent);
    switch (data.desc.type) {
      case 'matrix':
        this.build($p, [this.data.cols(), this.data.rows(), this.data.data()]);
        break;
      case 'table':
        this.build($p, [this.data.cols().map((v) => v.name), this.data.rows(), this.data.data()]);
        break;
      case 'vector':
        this.build($p, [
          ['Value'],
          this.data.ids(),
          this.data.data().then((data) => data.map((d) => [d]))
        ]);
        break;
    }
  }

  private build($parent:D3.Selection, promises:any[]) {
    var $table = $parent.append('table').attr('class','table').style({
      'font-size' : 'smaller'
    });
    $table.append('thead').append('tr');
    $table.append('tbody');
    C.all(promises).then((arr) => {
      var cols = arr[0], rows = arr[1], d = arr[2];
      var $headers = $table.select('thead tr').selectAll('th').data(['ID'].concat(cols));
      $headers.enter().append('th');
      $headers.text(C.identity);
      $headers.exit().remove();

      var $rows = $table.select('tbody').selectAll('tr').data(d);
      $rows.enter().append('tr');
      $rows.each(function (row, i) {
        var $header = d3.select(this).selectAll('th').data(rows.slice(i, i + 1));
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

export function create(data:datatypes.IDataType, parent:Element) {
  return new Table(data, parent);
}