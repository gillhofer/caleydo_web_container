/**
 * Created by sam on 09.02.2015.
 */
/// <amd-dependency path="css!./style" />
import C = require('../caleydo/main');
import ranges = require('../caleydo/range');
import geom = require('../caleydo/geom');
import provenance = require('./main');
import d3 = require('d3');
import d3util = require('../caleydo/d3util')
import vis = require('../caleydo/vis');


export class ProvenanceVis extends vis.AVisInstance implements vis.IVisInstance {
  private $node:D3.Selection;
  private rebind = (event, added) => {
    this.add(added);
    this.update();
  };
  private trigger = (event) => {
    this.update();
  };
  private force = d3.layout.force();
  private nodes = [];
  private links = [];
  private line = d3.svg.line().interpolate('linear-closed').x(C.getter(0)).y(C.getter(1));

  private node_drag = d3.behavior.drag()
  .on("dragstart", (d) => this.force.stop())
  .on("drag", (d) => {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    this.tick();
  })
  .on("dragend", () => this.force.resume());

  constructor(public data:provenance.ProvenanceGraph, public parent:Element, private options:any) {
    super();
    this.options = C.mixin({}, options);
    this.options.scale = [1, 1];
    this.options.rotate = 0;
    this.$node = this.build(d3.select(parent));
    C.onDOMNodeRemoved(this.node, this.destroy, this);

    this.bind();
    this.update();
    this.force.on('tick', () => this.tick());
  }

  private bind() {
    this.data.on('add_node', this.rebind);
    this.data.on('add_id', this.rebind);
    this.data.on('add_state', this.rebind);
    this.data.on('switch', this.trigger);
  }

  destroy() {
    super.destroy();
    this.force().stop();
    this.data.off('add_node', this.rebind);
    this.data.off('add_id', this.rebind);
    this.data.off('add_state', this.rebind);
    this.data.off('switch', this.trigger);
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
      'class' : 'provenance-graph-vis'
    }).style('transform', 'rotate(' + this.options.rotate + 'deg)');

    $svg.append('defs').append('marker')
      .attr('id', 'marker')
      .attr({
        'viewBox' : '0 -5 10 10',
        'refX' : 15,
        'refY' : -1.5,
        'markerWidth' : 6,
        'markerHeight' : 6,
        'orient' : 'auto'
      }).append('path').attr('d', 'M0,-5L10,0L0,5');
    var $g = $svg.append('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');

    $g.append('text').attr({
      x : 10,
      y: 20,
      'class' : 'action'
    }).text('Add Snapshot').on('click', () => {
      var name = prompt('Enter state name','NoName');
      this.data.takeSnapshot(name);
    });
    $g.append('g').attr('class', 'links');
    $g.append('g').attr('class', 'nodes');

    this.data.allCmds.map((f) => this.add(f));
    this.data.allStates.map((f) => this.add(f));
    this.data.allCmdIds.map((f) => this.add(f));

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

  private getNode(elem) {
    return C.search(this.nodes, (n) => n._ === elem);
  }

  private tick() {
    this.$node.select('g.nodes').selectAll('.node').attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    this.$node.select('g.links').selectAll('.link').attr({
      x1: (d) => d.source.x,
      y1: (d) => d.source.y,
      x2: (d) => d.target.x,
      y2: (d) => d.target.y
    });
  }

  private update() {
    var s = this.rawSize;
    var shapes = {
      id: this.line([[0, -5], [5, 5], [-5, 5]]),
      state: this.line([[-5, -5], [5, -5], [5, 5], [-5, 5]]),
      cmd: this.line([[0, -5], [5, 0], [0, 5], [-5, 0]])
    };

    var links = [];
    this.nodes.forEach((node) => {
      var _ = node._;
      switch(_.type) {
      case 'cmd':
        _.next.forEach((u) => {
          links.push({ source : node, target: this.getNode(u), type: 'next'});
        });
        break;
      case 'cmdid':
        if (_.createdBy) {
          links.push({ source : node, target: this.getNode(_.createdBy), type: 'createdBy'});
        }
        if (_.removedBy) {
          links.push({ source : node, target: this.getNode(_.removedBy), type: 'removedBy'});
        }
        _.usedBy.forEach((u) => {
          links.push({ source : node, target: this.getNode(u), type: 'usedBy'});
        });
        break;
      case 'state':
        if (_.resultOf) {
          links.push({ source : node, target: this.getNode(_.resultOf), type: 'resultOf'});
        }
        _.consistsOf.forEach((u) => {
          links.push({ source : node, target: this.getNode(u), type: 'consistsOf'});
        });
        break;
      }
    });


    this.force
      .stop()
      .nodes(this.nodes)
      .links(links)
      .size(s);




    var nodes = this.$node.select('g.nodes').selectAll('g').data(this.nodes);
    nodes.enter().append('g').attr({
      'class': (d) => 'node ' + d._.type
    }).call((sel) => {
      sel.append('path').attr('d', (d) => shapes[d._.type]).append('title').text((d) => d._.name);
      sel.filter((d) => d._.type === 'cmd').on('dblclick', (d) => {
        this.data.jumpTo(d._);
      })
    }).call(this.node_drag);
    nodes.filter((d) => d._.type === 'cmd')
      .classed('root', (d) => d._.isRoot)
      .classed('last', (d) => this.data.last === d._)
    .select('path').attr('class', (d) => d._.category);
    nodes.filter((d) => d._.type === 'state')
      .classed('last', (d) => d._ === this.data.actState);

    nodes.exit().remove();

    var link = this.$node.select('g.links').selectAll('line').data(links);
    link.enter().append('line').attr('marker-end','url(#marker)');
    link.attr({
      'class': (d) => 'link ' + d.type
    });
    link.exit().remove();

    this.force.start();
  }
}

export function create(data:provenance.ProvenanceGraph, parent:Element, options) {
  return new ProvenanceVis(data, parent, options);
}
