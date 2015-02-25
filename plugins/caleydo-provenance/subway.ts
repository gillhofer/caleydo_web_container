/**
 * Created by sam on 09.02.2015.
 */
/// <amd-dependency path="css!./style" />
import C = require('../caleydo/main');
import ranges = require('../caleydo/range');
import provenance = require('./main');
import d3 = require('d3');
import vis = require('../caleydo/vis');


export class SubwayVis extends vis.AVisInstance implements vis.IVisInstance {
  private $node:D3.Selection;
  private rebind = (event, added) => {
    this.add(added);
    this.update();
  };
  private rebindLink = (event, added) => {
    this.addLink(added);
    this.update();
  };
  private trigger = (event) => {
    this.update();
  };
  private nodes = [];
  private links = [];
  private line = d3.svg.line().interpolate('linear-closed').x(C.getter(0)).y(C.getter(1));
  private yscale = d3.scale.linear();

  constructor(public data:provenance.ProvenanceGraph, public parent:Element, private options:any) {
    super();
    this.options = C.mixin({}, options);
    this.options.scale = [1, 1];
    this.options.rotate = 0;
    this.$node = this.build(d3.select(parent));
    C.onDOMNodeRemoved(this.node, this.destroy, this);

    this.bind();
    this.update();
  }

  private bind() {
    this.data.on('add_action', this.rebind);
    this.data.on('add_object', this.rebind);
    this.data.on('add_state', this.rebind);
    this.data.on('add_edge', this.rebindLink);
    this.data.on('switch_action', this.trigger);
  }

  destroy() {
    super.destroy();
    this.data.off('add_action', this.rebind);
    this.data.off('add_object', this.rebind);
    this.data.off('add_state', this.rebind);
    this.data.off('add_edge', this.rebindLink);
    this.data.off('switch_action', this.trigger);
  }

  get rawSize() {
    return [130, 400];
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
    return C.resolved(null);
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
      height: size[1],
      'class' : 'provenance-subway-vis'
    }).style('transform', 'rotate(' + this.options.rotate + 'deg)');

    var $defs = $svg.append('defs');
    var $g = $svg.append('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');

    $svg.append('g').attr('class', 'actions');
    $svg.append('g').attr('class', 'objects');
    $svg.append('g').attr('class', 'states');

    return $svg;
  }

  private add(elem) {
    if (!elem) {
      return;
    }
    var n = {
      _: elem
    };
    this.nodes.push(n);
  }

  private addLink(l) {
    var link = {
      _ : l,
      source: this.getNode(l.source),
      target: this.getNode(l.target),
      type : l.type
    };
    if (link.source && link.target) {
      this.links.push(link);
    }
  }

  private getNode(elem) {
    return C.search(this.nodes, (n) => n._ === elem);
  }

  private update() {
    var s = this.rawSize,
      graph = this.data,
      states = graph.states,
      act = graph.act,
      pathtosource = act.path;

    var $states = this.$node.select('g.states').selectAll('.state').data(states, (d) => d.id);
    $states.enter().append('g').classed('state',true).append('rect').attr({
      x : -10,
      y : -20,
      width: 20,
      height: 40,
      rx : 2,
      ry : 2,
      transform: translate()
    });
    $states.classed('active', (d) => pathtosource.indexOf(d) >= 0);
    $states.classed('act', (d) => d === act);
    //FIXME
    $states.attr('transform', (d) => translate(100,0));

    $states.exit().remove();
  }
}

export function create(data:provenance.ProvenanceGraph, parent:Element, options) {
  return new SubwayVis(data, parent, options);
}
