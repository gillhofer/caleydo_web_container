/**
 * Created by sam on 09.02.2015.
 */
import C = require('../caleydo/main');
import ranges = require('../caleydo/range');
import geom = require('../caleydo/geom');
import provenance = require('./main');
import d3 = require('d3');
import d3util = require('../caleydo/d3util')
import vis = require('../caleydo/vis');



export class ProvenanceVis extends vis.AVisInstance implements vis.IVisInstance {
  private $node:D3.Selection;

  constructor(public data:provenance.ProvenanceGraph, public parent:Element, private options:any) {
    super();
    this.options = C.mixin({

    }, options);
    this.options.scale = [1, 1];
    this.options.rotate = 0;
    this.$node = this.build(d3.select(parent));
  }

  get rawSize() {
    return [800, 400];
  }

  get node() {
    return this.$node.node();
  }

  option(name:string, val?:any) {
    if (arguments.length === 1) {
      return this.options[name];
    } else {
      this.fire('option.' + name, val, this.options[name]);
      this.options[name] = val;

    }
  }

  locateImpl(range:ranges.Range) {
    var dims = this.data.dim;
    var height = dims[0], width=20, o = this.options;

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


  private build($parent:D3.Selection) {
    var size = this.size,
      scale = this.options.scale;
    var $svg = $parent.append('svg').attr({
      width: size[0],
      height: size[1]
    }).style('transform', 'rotate(' + this.options.rotate + 'deg)');
    var $g = $svg.append('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');

    var data = this.data;


    return $svg;
  }
}

export function create(data:provenance.ProvenanceGraph, parent:Element, options) {
  return new ProvenanceVis(data, parent, options);
}
