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

export class HeatMap extends plugins.AVisInstance {
  private $node:D3.Selection;
  private colorer : D3.Scale.LinearScale;

  constructor(public data:matrix.IMatrix, public parent:Element, private options: any) {
    super();
    this.options = C.mixin({
      initialScale: 10,
      color: ['black', 'white'],
      domain: (<any>this.data.desc).value.range
    }, options);
    this.options.scale = [this.options.initialScale,this.options.initialScale];
    this.options.rotate = 0;
    this.colorer = d3.scale.linear().domain(this.options.domain).range(this.options.color);
    this.$node = this.build(d3.select(parent));
  }

  get node() {
    return this.$node.node();
  }

  option(name: string, val? : any) {
    if (arguments.length === 1) {
      return this.options[name];
    } else {
      this.fire('option.'+name, val, this.options[name]);
      this.options[name] = val;
      switch(name) {
        case 'color':
        case 'domain':
          this.recolor();
          break;
      }
    }
  }

  locateImpl(range: ranges.Range) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    function l(r, max) {
      if (r.isAll || r.isNone) {
        return [0, max*this.options.scale[1]];
      }
      var ex : any =  d3.extent(r.iter().asList());
      return [ex[0] * this.options.scale[1], (ex[1] - ex[0] + 1) * this.options.scale[1]];
    }
    var xw = l(range.dim(1), width);
    var yh = l(range.dim(0), height);
    return C.resolved(geom.rect(xw[0],yh[0],xw[1],yh[1]));
  }

  transform(scale: number[], rotate: number = 0) {
    this.$node.attr({
      width: this.options.width * scale[0],
      height: this.options.height * scale[1]
    }).style('transform','rotate('+rotate+'deg)');
    this.$node.select('g').attr('transform','scale('+scale[0]+','+scale[1]+')');
    this.fire('transform',{
      scale: scale,
      rotate: rotate
    });
    this.options.scale = scale;
    this.options.rotate = rotate;
    return true;
  }

  private recolor() {
    var c = this.colorer;
    c.domain(this.options.domain).range(this.options.color);
    this.$node.selectAll('rect').attr('fill', (d) => c(d));
  }

  private build($parent:D3.Selection) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    var $svg = $parent.append('svg').attr({
      width: width * this.options.initialScale,
      height: height * this.options.initialScale
    });
    var $g = $svg.append('g').attr('transform','scale('+this.options.initialScale+','+this.options.initialScale+')');

    var c = this.colorer;
    var data = this.data;

    data.data().then((arr) => {
      var $rows = $g.selectAll('g').data(arr);
      $rows.enter().append('g');
      $rows.each(function (row, i) {
        var $cols = d3.select(this).selectAll('rect').data(row);
        $cols.enter().append('rect').on('click', (d, j) => {
          data.select([
            [i],
            [j]
          ], idtypes.toSelectOperation(d3.event));
        }).attr({
          width: 1,
          height: 1
        }).append('title').text(C.identity);
        $cols.attr({
          fill: (d) => c(d),
          x: (d, j) => j,
          y: i
        });
        $cols.exit().remove();
      });
      $rows.exit().remove();
    });
    var l = function (event, type, selected) {
      $g.selectAll('rect').classed('select-' + type, false);
      if (selected.isNone) {
        return;
      }
      var dim0 = selected.dim(0), dim1 = selected.dim(1);
      if (selected.isAll) {
        $g.selectAll('rect').classed('select-' + type, true);
      } else if (dim0.isAll || dim0.isNone) {
        dim1.forEach((j) => {
          $g.selectAll('g rect:nth-child(' + (j + 1) + ')').classed('select-' + type, true);
        });
      } else if (dim1.isAll || dim1.isNone) {
        dim0.forEach((i) => {
          $g.selectAll('g:nth-child(' + (i + 1) + ') rect').classed('select-' + type, true);
        });
      } else {
        dim0.forEach((i) => {
          var row = $g.select('g:nth-child(' + (i + 1) + ')');
          dim1.forEach((j) => {
            row.select('rect:nth-child(' + (j + 1) + ')').classed('select-' + type, true);
          });
        });
      }
    };
    data.on('select', l);
    C.onDOMNodeRemoved($g.node(), function () {
      data.off('select', l);
    });
    data.selections().then(function (selected) {
      l(null, 'selected', selected);
    });

    return $svg;
  }
}

export function create(data:matrix.IMatrix, parent:Element, options) {
  return new HeatMap(data, parent, options);
}
