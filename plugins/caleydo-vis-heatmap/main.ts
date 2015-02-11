/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path='../../tsd.d.ts' />
/* global define */
'use strict';

import d3 = require('d3');
import d3utils = require('../caleydo/d3util');
import vis = require('../caleydo/vis');
import matrix = require('../caleydo/matrix');
import vector = require('../caleydo/vector');
import datatypes = require('../caleydo/datatype');

import idtypes = require('../caleydo/idtype');
import geom = require('../caleydo/geom');
import ranges = require('../caleydo/range');
import C = require('../caleydo/main');


function defaultColor(value: any) {
  if (value.type === 'categorical') {
    return value.categories.map((c) => c.color);
  }
  return ['black', 'white'];
}
function defaultDomain(value) {
  if (value.type === 'categorical') {
    return value.categories.map((c) => c.name);
  }
  return value.range;
}
function toScale(value): D3.Scale.Scale {
  if (value.type === 'categorical') {
    return d3.scale.ordinal();
  }
  return d3.scale.linear();
}

export class HeatMap extends vis.AVisInstance implements vis.IVisInstance {
  private $node:D3.Selection;
  private colorer : D3.Scale.Scale;

  constructor(public data:matrix.IMatrix, public parent:Element, private options: any) {
    super();
    var value = (<any>this.data.desc).value;
    this.options = C.mixin({
      initialScale: 10,
      color: defaultColor(value),
      domain: defaultDomain(value)
    }, options);
    this.options.scale = [this.options.initialScale,this.options.initialScale];
    this.options.rotate = 0;
    this.colorer = toScale(value).domain(this.options.domain).range(this.options.color);
    this.$node = this.build(d3.select(parent));
  }

  get rawSize() {
    var d = this.data.dim;
    return [d[1], d[0]];
  }

  get node() {
    return this.$node.node();
  }

  option(name: string, val? : any) {
    if (arguments.length === 1) {
      return this.options[name];
    } else {
      this.fire('option', name, val, this.options[name]);
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

  locateImpl(range:ranges.Range) {
    var dims = this.data.dim;
    var width = dims[1], height = dims[0], o = this.options;

    function l(r, max, s) {
      if (r.isAll || r.isNone) {
        return [0, max * s];
      }
      var ex:any = d3.extent(r.iter().asList());
      return [ex[0] * s, (ex[1] - ex[0] + 1) * s];
    }

    var xw = l(range.dim(1), width, o.scale[0]);
    var yh = l(range.dim(0), height, o.scale[1]);
    return C.resolved(geom.rect(xw[0], yh[0], xw[1], yh[1]));
  }

  transform(scale?: number[], rotate: number = 0) {
    var bak = {
      scale: this.options.scale || [1,1],
      rotate: this.options.rotate || 0
    };
    if (arguments.length === 0) {
      return bak;
    }
    var dims = this.data.dim;
    var width = dims[1], height = dims[0];
    this.$node.attr({
      width: width * scale[0],
      height: height * scale[1]
    }).style('transform','rotate('+rotate+'deg)');
    this.$node.select('g').attr('transform','scale('+scale[0]+','+scale[1]+')');
    var new_ = {
      scale: scale,
      rotate: rotate
    };
    this.fire('transform',new_, bak);
    this.options.scale = scale;
    this.options.rotate = rotate;
    return new_;
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


export class HeatMap1D extends vis.AVisInstance implements vis.IVisInstance {
  private $node:D3.Selection;
  private colorer:D3.Scale.Scale;

  constructor(public data:vector.IVector, public parent:Element, private options:any) {
    super();
    var value = (<any>this.data.desc).value;
    this.options = C.mixin({
      initialScale: 10,
      color: defaultColor(value),
      domain: defaultDomain(value)
    }, options);
    this.options.scale = [1, this.options.initialScale];
    this.options.rotate = 0;
    this.colorer = toScale(value).domain(this.options.domain).range(this.options.color);
    this.$node = this.build(d3.select(parent));
  }

  get rawSize() {
    var d = this.data.dim;
    return [20, d[0]];
  }

  get node() {
    return this.$node.node();
  }

  option(name:string, val?:any) {
    if (arguments.length === 1) {
      return this.options[name];
    } else {
      this.fire('option', name, val, this.options[name]);
      this.fire('option.' + name, val, this.options[name]);
      this.options[name] = val;
      switch (name) {
        case 'color':
        case 'domain':
          this.recolor();
          break;
      }
    }
  }

  locateImpl(range:ranges.Range) {
    var dims = this.data.dim;
    var height = dims[0], o = this.options;

    function l(r, max, s) {
      if (r.isAll || r.isNone) {
        return [0, max * s];
      }
      var ex:any = d3.extent(r.iter().asList());
      return [ex[0] * s, (ex[1] - ex[0] + 1) * s];
    }

    var yh = l(range.dim(0), height, o.scale[1]);
    return C.resolved(geom.rect(0, yh[0], 20, yh[1]));
  }

  transform(scale?:number[], rotate:number = 0) {
    var bak = {
      scale: this.options.scale || [1, 1],
      rotate: this.options.rotate || 0
    };
    if (arguments.length === 0) {
      return bak;
    }
    var dims = this.data.dim;
    var width = 20, height = dims[0];
    this.$node.attr({
      width: width * scale[0],
      height: height * scale[1]
    }).style('transform', 'rotate(' + rotate + 'deg)');
    this.$node.select('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');
    var new_ = {
      scale: scale,
      rotate: rotate
    };
    this.fire('transform', new_, bak);
    this.options.scale = scale;
    this.options.rotate = rotate;
    return new_;
  }

  private recolor() {
    var c = this.colorer;
    c.domain(this.options.domain).range(this.options.color);
    this.$node.selectAll('rect').attr('fill', (d) => c(d));
  }

  private build($parent:D3.Selection) {
    var dims = this.data.dim;
    var width = 20, height = dims[0];
    var $svg = $parent.append('svg').attr({
      width: width,
      height: height * this.options.initialScale
    });
    var $g = $svg.append('g').attr('transform', 'scale(1,' + this.options.initialScale + ')');

    var c = this.colorer;
    var data = this.data;


    data.data().then((arr) => {
      var $rows = $g.selectAll('rect').data(arr);
      var onClick = d3utils.selectionUtil(data, $g, 'rect');
      $rows.enter().append('rect').on('click', onClick).attr({
        width: 20,
        height: 1
      }).append('title').text(C.identity);
      $rows.attr({
        fill: (d) => c(d),
        y: (d,i) => i
      });
      $rows.exit().remove();
    });
    return $svg;
  }
}

export function create(data:vector.IVector, parent:Element, options);
export function create(data:matrix.IMatrix, parent:Element, options);
export function create(data:datatypes.IDataType, parent:Element, options): vis.AVisInstance {
  if (data.desc.type === 'matrix') {
    return new HeatMap(<matrix.IMatrix>data, parent, options);
  } else if (data.desc.type === 'vector') {
    return new HeatMap1D(<vector.IVector>data, parent, options);
  }
  return null;
}
