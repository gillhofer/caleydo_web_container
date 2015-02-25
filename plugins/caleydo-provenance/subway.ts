/**
 * Created by sam on 09.02.2015.
 */
/// <amd-dependency path="css!./style" />
import C = require('../caleydo/main');
import ranges = require('../caleydo/range');
import provenance = require('./main');
import d3 = require('d3');
import vis = require('../caleydo/vis');

function translate(x = 0, y = 0) {
  return 'translate('+x+','+y+')';
}


var provGraphX = {
  nodes : [ //time order by array order except for prev link
    { type : 'action', name: 'D1A', category: 'data', operation: 'create', links: { creates: 'D1'} },
    { type : 'object', name: 'D1', category: 'data' },
    { type : 'action', name: 'D2V1A', category: 'visual', operation: 'create', links: { creates: 'D1V', requires: 'D1'} },
    { type : 'object', name: 'D1V', category: 'visual' },

    { type : 'action', name: 'D2A', category: 'data', operation: 'create', links: { creates: 'D2'} },
    { type : 'object', name: 'D2', category: 'data' },
    { type : 'action', name: 'D2V1A', category: 'visual', operation: 'create', links: { creates: 'D2V1', requires: 'D2'} },
    { type : 'object', name: 'D2V1', category: 'visual' },

    { type : 'action', name: 'S2', category: 'selection', operation: 'update' },

    { type : 'action', name: 'D2A2', category: 'data', operation: 'update', links: { requires: 'D2'} },
    { type : 'action', name: 'D2V1A2', category: 'visual', operation: 'update', links: { requires: 'D2V1'} },

    { type : 'action', name: 'D1V1A', category: 'visual', operation: 'create', links: { creates: 'D1V2', requires: 'D1'} },
    { type : 'object', name: 'D1V2', category: 'visual' },
    { type : 'action', name: 'D1V1A', category: 'visual', operation: 'update', links: { requires: 'D1V2'} },

    { type : 'action', name: 'S1', category: 'selection', operation: 'update' },

    { type : 'action', name: 'D2V2A', category: 'visual', operation: 'remove', links: { removes: 'D2V1'} },
    { type : 'action', name: 'S3', category: 'selection', operation: 'update' },
    { type : 'action', name: 'D2V2A', category: 'visual', operation: 'remove', links: { removes: 'D1V2'} },
    { type : 'action', name: 'D1A3', category: 'data', operation: 'remove', links: { removes: 'D1'} },

    { type : 'action', name: 'D3A', category: 'data', operation: 'create', links: { prev: 'S1', creates: 'D3' } },
    { type : 'object', name: 'D3', category: 'data' },
    { type : 'action', name: 'D3V1', category: 'visual', operation: 'create', links: { creates: 'D3V1', requires: 'D3'} },
    { type : 'object', name: 'D3V1', category: 'visual' },
    { type : 'action', name: 'D1V1A2', category: 'visual', operation: 'update', links: { requires: 'D3V1'} },
    { type : 'action', name: 'S4', category: 'selection', operation: 'update' },
    { type : 'action', name: 'D1V1A3', category: 'visual', operation: 'update', links: {  requires: 'D3V1'} },

     //data, visual, selection, layout
    /*{
      type : 'action', //object, action, state
      category : '', //data, visual, selection, layout
      operation: '', //create, update, remove
      name: ''
    },*/
  ]
};

function toGraph(graph) {
  var byName = {}, toActionIndex = {};
  graph.nodes.forEach(function(g) {
    byName[g.name] = g;
  });
  //resolve links
  graph.nodes.forEach(function(g, i) {
    if (g.links) {
      Object.keys(g.links).forEach(function(k) {
        var v = g.links[k];
        if (Array.isArray(v)) {
          v = v.map(function(vi) { return byName[vi] });
        } else {
          v = byName[v];
        }
        g.links[k] = v;
      })
    } else {
      g.links = {};
    }
  });
  function state(action) {
    var r= { type: 'state', name: action?action.name: 'start', links: { from: action, to: [], consistsOf : []}};
    if (action) {
      action.link.leadsTo = r;
    }
    return r;
  }
  var actions = graph.nodes.filter(function(g) { return g.type === 'action' });
  actions.forEach(function(a, i) { toActionIndex[a.name] = i });
  var objects = graph.nodes.filter(function(g) { g.type === 'object' });
  objects.forEach(function(o) { o.links.usedBy = [] });
  //every action leads to new state
  var states = [state(null)].concat(actions.map(function(a) { return state(a) }));
  //create object links
  actions.forEach(function(a, i) {
    if (a.links.requires) { //requires
      if (!Array.isArray(a.links.requires)) {
        a.links.requires = [a.links.requires];
      }
      a.links.requires.forEach(function(o) {o.links.usedBy.push(a) })
    } else {
      a.links.requires = [];
    }
    if (a.links.creates) { //creates
      if (!Array.isArray(a.links.creates)) {
        a.links.creates = [a.links.creates];
      }
      a.links.creates.forEach(function(o) {o.links.createdBy =  })
    } else {
      a.links.creates = [];
    }
    if (a.links.removes) { //removes
      if (!Array.isArray(a.links.removes)) {
        a.links.removes = [a.links.removes];
      }
      a.links.removes.forEach(function(o) { o.links.removedBy = a })
    } else {
      a.links.removes = [];
    }
    if (a.links.prev) { //create prev link
      a.links.prev = a.links.prev.links.leadsTo;
    } else {
      a.links.prev = i > 0 ? actions[i-1].links.leadsTo : null;
    }
    a.links.prev.links.to.push(a); //to link

  });
  states.slice(1).forEach(function(s) {
    var r = s.links.from.links.consistsOf.slice();
    r.push.apply(r, s.links.from.links.creates);
    s.links.from.removes.forEach(function(rem) {
      r.splice(r.indexOf(rem),1);
    });
    s.links.consistsOf = r;
  });

  return {
    states: states,
    actions: actions,
    objects: objects
  };
}

var provGraph = {
  nodes : [
    {
      type : 'state', //object, action, state
      name: 'start'
    },
  ],
  links: [
    {
      type: '', //consistsOf, createdBy, removedBy, leadsTo, next, requires
      source: 0,
      target: 0
    }
  ]
};

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
