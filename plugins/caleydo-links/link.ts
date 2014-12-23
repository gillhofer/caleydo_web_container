/**
 * Created by Samuel Gratzl on 16.12.2014.
 */

import C = require('../caleydo/main');
import geom = require('../caleydo/geom');
import events = require('../caleydo/event');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');
import vis = require('../caleydo/vis');
import d3 = require('d3');

export interface IDataVis extends events.IEventHandler, vis.ILocateAble {
  id: number;
  location : geom.AShape;
}

class VisWrapper implements vis.ILocateAble {
  callbacks : Array<(v : VisWrapper) => void> = [];
  private lookup: D3.Map<number> = d3.map();

  private l = () => {
    this.callbacks.forEach((c) => c(this));
  };

  constructor(private v : IDataVis, private dirtyEvents : string[]) {
    this.dirtyEvents.forEach((event) => v.on(event, this.l));
    this.v.data.idtypes.forEach((idtype, i) => {
      this.lookup.set(idtype.id, i);
    });
  }

  get vis() {
    return this.v;
  }

  get id() {
    return this.v.id;
  }

  get location() {
    return this.v.location;
  }

  dimOf(idtype : idtypes.IDType) {
    if (!this.lookup.has(idtype.id)) {
      return -1;
    }
    return this.lookup.get(idtype.id);
  }

  get data() {
    return this.vis.data;
  }

  ids() {
    return this.data.ids();
  }

  get idtypes() {
    return this.data.idtypes;
  }

  locate(...range: ranges.Range[]): C.IPromise<any> {
    return this.vis.locate.apply(this.vis, range);
  }

  destroy() {
    this.dirtyEvents.forEach((event) => this.v.off(event, this.l));
  }
}

function selectCorners(a: geom.AShape, b: geom.AShape) {
  var ac = a.aabb(),
    bc = b.aabb();
  if (ac.cx > bc.cx) {
    return ['w','e'];
  } else {
    return ['e','w'];
  }
  // TODO better
}


var line = d3.svg.line().interpolate('linear-closed').x((d) => d.x).y((d) => d.y);

interface ILink {
  clazz : string;
  id : string;
  d : string;
}


function toId(a,b) {
  a = typeof a === 'number' ? a : a.id;
  b = typeof b === 'number' ? b : b.id;
  return Math.min(a,b)+'-'+Math.max(a,b);
}

class Link {
  constructor(public a : VisWrapper, public b: VisWrapper, private $g : D3.Selection, private idtype : idtypes.IDType, private all: VisWrapper[]) {

  }

  update() {
    if (!this.shouldRender()) {
      this.render([]);
      return;
    }
    var factories = [this.createBlockRep(), this.createGroupRep(), this.createItemRep() ];
    C.all(factories).then((llinks) => {
      var links = [].concat.apply([], llinks);
      this.render(links);
    });
  }

  private shouldRender() {
    var aa = this.a.location.aabb(),
      bb = this.b.location.aabb(),
      tmp;
    if (aa.x2 < (bb.x - 10)) {
      //nothing to do
    } else if (bb.x2 < (aa.x - 10)) {
      //swap
      tmp = bb;
      bb = aa;
      aa = tmp;
    } else {
      return false;
    }
    var shape = geom.polygon(aa.corner('ne'), bb.corner('nw'), bb.corner('sw'), aa.corner('se'));
    //check if we have an intersection
    return this.all.every((other) => {
      if (other === this.a || other === this.b) { //don't check me
        return true;
      }
      var o = other.location;
      var int = shape.intersects(o);
      return !int.intersects;
    });
  }

  private render(links : ILink[]) {
    var $links = this.$g.selectAll('path').data(links, (d) => d.id);
    $links.enter().append('path');
    $links.exit().remove();
    $links.attr({
      'class' : (d) => d.clazz,
      d: (d) => d.d
    });
  }

  private createBlockRep():C.IPromise<ILink[]> {
    var aa = this.a.location.aabb(),
      bb = this.b.location.aabb(),
      tmp;
    if (aa.x2 < (bb.x - 10)) {
      //nothing to do
    } else if (bb.x2 < (aa.x - 10)) {
      //swap
      tmp = bb;
      bb = aa;
      aa = tmp;
    } else {
      //too close
      return C.resolved([]);
    }
    var l = [aa.corner('ne'), bb.corner('nw'), bb.corner('sw'), aa.corner('se')];
    return C.resolved([{
      clazz: 'rel-block',
      d: line.interpolate('linear-closed')(l),
      id: 'block'
    }]);
  }

  private createGroupRep():C.IPromise<ILink[]> {
    return C.resolved([]);
  }

  private createItemRep():C.IPromise<ILink[]> {
    var adim = this.a.dimOf(this.idtype),
      bdim = this.b.dimOf(this.idtype),
      amulti = this.a.data.dim.length > 1,
      bmulti = this.b.data.dim.length > 1;

    function toPoint(loc, other, multi) {
      if (!multi) {
        return loc.center;
      }
      var c = selectCorners(loc, other);
      return loc.corner(c[0]);
    }
    return C.all([this.a.ids(), this.b.ids()]).then((ids) => {
      var ida:ranges.Range1D = ids[0].dim(adim);
      var idb:ranges.Range1D = ids[1].dim(bdim);
      var union = ida.union(idb);
      var ars = [], brs = [];
      union.forEach((index) => {
        var r = ranges.all();
        r.dim(adim).setList([index]);
        ars.push(r);

        r = ranges.all();
        r.dim(bdim).setList([index]);
        brs.push(r);
      });
      return C.all([C.resolved(union), this.a.locate.apply(this.a, ars), this.b.locate.apply(this.b, brs)]);
    }).then((locations) => {
      var union = locations[0],
        loca = locations[1],
        locb = locations[2];
      var r = [];
      line.interpolate('linear');
      union.forEach((id, i) => {
        var la = geom.wrap(loca[i]);
        var lb = geom.wrap(locb[i]);
        if (la && lb) {
          r.push({
            clazz: 'rel-item',
            id: id,
            d: line([toPoint(la, lb, amulti), toPoint(lb, la, bmulti)])
          });
        }
      });
      return r;
    });
  }
}

class LinkIDTypeContainer {
  private listener = (event, type:string, selected: ranges.Range, added: ranges.Range, removed: ranges.Range) => this.selectionUpdate(type, selected, added, removed);
  private change = (elem: VisWrapper) => this.changed(elem);
  private arr : VisWrapper[] = [];
  private $node : D3.Selection;

  constructor(public idtype: idtypes.IDType, private parent: Element) {
    idtype.on('select', this.listener);
    this.$node = d3.select(parent).append('svg');
    this.$node.style({
      left: '0px',
      top: '0px'
    });
    this.$node.append('g');
    C.onDOMNodeRemoved(this.$node.node(), this.destroy, this);
  }

  private selectionUpdate(type:string, selected: ranges.Range, added: ranges.Range, removed: ranges.Range) {
    //TODO
  }

  private changed(elem: VisWrapper) {
    if (this.arr.length > 1) {
      this.render(elem);
    }
  }

  private moveSVG() {
    var l = this.arr[0].location.aabb();
    this.arr.forEach((a) => {
      var b = a.location.aabb(), d = 0;
      if (b.x < l.x) {
        d = l.x - b.x;
        l.x -= d;
        l.w += d;
      }
      if (b.x2 > l.x2) {
        l.x2 = b.x2;
      }
      if (b.y < l.y) {
        d = l.y - b.y;
        l.y -= d;
        l.h += d;
      }
      if (b.y2 > l.y2) {
        l.y2 = b.y2;
      }
    });
    this.$node.attr({
      width: l.w,
      height: l.h
    });
    this.$node.style({
      left: l.x + 'px',
      top : l.y + 'px'
    });
    this.$node.select('g').attr('transform', 'translate(' + (-l.x) + ',' + (-l.y) + ')');
  }

  private prepareCombinations() {
    var $root = this.$node.select('g');
    var combinations = [];
    var l = this.arr.length, i, j, a,b;
    for (i = 0; i < l; ++i) {
      a = this.arr[i].id;
      for (j = 0; j < i; ++j) {
        b = this.arr[j].id;
        combinations.push(toId(a, b));
      }
    }
    var $combi = $root.selectAll('g').data(combinations);
    $combi.enter().append('g');
    $combi.exit().remove();
    $combi.attr('data-id', C.identity);
  }

  private render(elem: VisWrapper) {
    //move the svg to just the bounding box
    this.moveSVG();
    this.prepareCombinations();
    var $root = this.$node.select('g');

    this.arr.forEach((o) => {
      if (o !== elem) {
        var id = toId(o, elem);
        var $g = $root.select('g[data-id="' + id + '"]');
        new Link(o, elem, $g, this.idtype, this.arr).update();
      }
    });
  }

  private destroy() {
    this.idtype.off('select', this.listener);
    this.$node.remove();
  }

  push(elem: VisWrapper) {
    var idtypes = elem.idtypes;
    if (idtypes.indexOf(this.idtype) >= 0) {
      this.arr.push(elem);
      elem.callbacks.push(this.change);
      if (this.arr.length > 1) {
        this.render(elem);
      }
    }
  }
  remove(elem: VisWrapper) {
    var index = this.arr.indexOf(elem);
    if (index >= 0) {
      this.arr.splice(index, 1);
      elem.callbacks.splice(elem.callbacks.indexOf(this.change), 1);
      this.prepareCombinations();
    }
    return this.arr.length === 0;
  }

}

export class LinkContainer {
  private arr : VisWrapper[] = [];
  node = document.createElement('div');

  private links : LinkIDTypeContainer[] = [];

  constructor(private parent: Element, private dirtyEvents: string[]) {
    parent.appendChild(this.node);
    this.node.classList.add('link-container');
    C.onDOMNodeRemoved(this.node, this.destroy, this);
  }

  push(...elems : IDataVis[]) {
    elems.forEach((elem) => {
      var w = new VisWrapper(elem, this.dirtyEvents);
      this.arr.push(w);
      var idtypes = w.idtypes.slice();
      //update all links
      this.links.forEach((l) => {
        l.push(w);
        var index = idtypes.indexOf(l.idtype);
        if (index >= 0) {
          idtypes.splice(index, 1);
        }
      });
      //add missing idtypes
      idtypes.forEach((idtype) => {
        var n = new LinkIDTypeContainer(idtype,  this.node);
        n.push(w);
        this.links.push(n);
      });
    });
  }

  remove(elem: IDataVis) {
    var index = C.indexOf(this.arr, (w) => w.vis === elem);
    if (index < 0) {
      return false;
    }
    var w = this.arr[index];
    w.destroy();
    this.links = this.links.filter((l) => l.remove(w));
    this.arr.splice(index, 1);
    return true;
  }

  private destroy() {
    this.node.parentElement.removeChild(this.node);
    this.arr.forEach(VisWrapper.prototype.destroy.call);
  }
}


