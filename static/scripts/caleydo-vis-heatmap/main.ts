/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />
/* global define */
"use strict"

import d3 = require('d3');
import plugins = require('../caleydo/plugin');
import matrix = require('../caleydo/matrix');
import idtypes = require('../caleydo/idtype')
import geom = require('../caleydo/geom');
import ranges = require('../caleydo/range');
import C = require('../caleydo/main');

export class HeatMap implements plugins.IVisInstance {
  node:Element;

  constructor(public data:matrix.IMatrix, public parent:Element) {
    this.node = this.build(d3.select(parent));
  }

  locate(...range:ranges.Range[]) {
    if (range.length === 1) {
      return this.locateImpl(range[0]);
    }
    return C.all(range.map(this.locateImpl, this));
  }
  private locateImpl(range: ranges.Range) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    function l(r, max) {
      if (r.isAll || r.isNone) {
        return [0, max*10];
      }
      var ex : any =  d3.extent(r.iter().asList());
      return [ex[0] * 10, (ex[1] - ex[0] + 1) * 10];
    }
    var xw = l(range.dim(1), width);
    var yh = l(range.dim(0), height);
    return C.resolved(geom.rect(xw[0],yh[0],xw[1],yh[1]));
  }

  persist() {
    return null;
  }

  restore(persisted: any) {
    return null;
  }

  private build($parent:D3.Selection) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    var $svg = $parent.append('svg').attr({
      width: width * 10,
      height: height * 10
    });

    var colScale = d3.scale.linear().domain([0, width]).range([0, 100]);
    var rowScale = d3.scale.linear().domain([0, height]).range([0, 100]);
    var c = d3.scale.linear().domain((<any>this.data.desc).value.range).range(['black', 'white']);
    var data = this.data;
    data.data().then((arr) => {
      var $rows = $svg.selectAll('g').data(arr);
      $rows.enter().append('g');
      $rows.each(function (row, i) {
        var $cols = d3.select(this).selectAll('rect').data(row);
        $cols.enter().append('rect').on('click', function (d, j) {
          data.select([
            [i],
            [j]
          ], idtypes.toSelectOperation(d3.event));
        }).append('title').text(C.identity);
        $cols.attr({
          fill: function (d) {
            return c(d);
          },
          x: function (d, j) {
            return colScale(j) + '%';
          },
          y: rowScale(i) + '%',
          width: colScale(1) + '%',
          height: rowScale(1) + '%'
        });
        $cols.exit().remove();
      });
      $rows.exit().remove();
    });
    var l = function (event, type, selected) {
      $svg.selectAll('rect').classed('select-' + type, false);
      if (selected.isNone) {
        return;
      }
      var dim0 = selected.dim(0), dim1 = selected.dim(1);
      if (selected.isAll) {
        $svg.selectAll('rect').classed('select-' + type, true);
      } else if (dim0.isAll || dim0.isNone) {
        dim1.forEach((j) => {
          $svg.selectAll('g rect:nth-child(' + (j + 1) + ')').classed('select-' + type, true);
        });
      } else if (dim1.isAll || dim1.isNone) {
        dim0.forEach((i) => {
          $svg.selectAll('g:nth-child(' + (i + 1) + ') rect').classed('select-' + type, true);
        });
      } else {
        dim0.forEach((i) => {
          var row = $svg.select('g:nth-child(' + (i + 1) + ')');
          dim1.forEach((j) => {
            row.select('rect:nth-child(' + (j + 1) + ')').classed('select-' + type, true);
          });
        });
      }
    };
    data.on('select', l);
    C.onDOMNodeRemoved($svg.node(), function () {
      data.off('select', l);
    });
    data.selections().then(function (selected) {
      l(null, 'selected', selected);
    });

    return $svg.node();
  }
}

export function create(data:matrix.IMatrix, parent:Element) {
  return new HeatMap(data, parent);
}
