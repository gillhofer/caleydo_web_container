/**
 * Created by Samuel Gratzl on 16.12.2014.
 */

import C = require('../caleydo/main');
import datatypes = require('../caleydo/datatype');
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
  callbacks : Array<(v : IDataVis) => void> = [];

  private l = () => {
    this.callbacks.forEach((c) => c(this.v));
  };

  constructor(private v : IDataVis, private dirtyEvents : string[]) {
    this.dirtyEvents.forEach((event) => v.on(event, this.l));
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

  get data() {
    return this.vis.data;
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
  //TODO better
}


var line = d3.svg.line().interpolate('linear-closed').x((d) => d.x).y((d) => d.y);

function createBlockRep(a : geom.AShape, b: geom.AShape, paths : any[]) {
  var aa = a.aabb();
  var bb = b.aabb();
  if (aa.x2 < (bb.x - 10)) {

  } else if (bb.x2 < (aa.x - 10)) {
    //swap
    bb = aa;
    aa = b.aabb();
  } else {
    //too close
    return;
  }
  var l = [aa.corner('ne'), bb.corner('nw'), bb.corner('sw'), aa.corner('se')];
  paths.push({
    clazz : 'rel-block',
    d : line(l)
  });
}

class LinkIDTypeContainer {
  private listener = (event, type:string, selected: ranges.Range, added: ranges.Range, removed: ranges.Range) => this.selectionUpdate(type, selected, added, removed);
  private change = (elem: IDataVis) => this.changed(elem);
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

  private changed(elem: IDataVis) {
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

  private render(elem: IDataVis) {
    //move the svg to just the bounding box
    this.moveSVG();

    var $root = this.$node.select('g');

    var index = C.indexOf(this.arr, (v) => v.vis === elem);
    var arr = this.arr;
    function toId(a,b) {
      a = typeof a === 'number' ? a : a.id;
      b = typeof b === 'number' ? b : b.id;
      return Math.min(a,b)+'-'+Math.max(a,b)
    }
    function prepareCombinations() {
      var combinations = [];
      var l = arr.length, i, j, a,b;
      for (i = 0; i < l; ++i) {
        a = arr[i].id;
        for (j = 0; j < i; ++j) {
          b = arr[j].id;
          combinations.push(toId(a, b));
        }
      }
      var $combi = $root.selectAll('g').data(combinations);
      $combi.enter().append('g');
      $combi.exit().remove();
      $combi.attr('data-id', C.identity);
    }

    prepareCombinations();

    function createLink(a, b) {
      var id = toId(a, b);
      var $g = $root.select('g[data-id="' + id + '"]');
      var loca = a.location;
      var locb = b.location;

      var links = [];
      createBlockRep(loca, locb, links);

      var $links = $g.selectAll('path').data(links);
      $links.enter().append('path');
      $links.exit().remove();
      $links.attr({
        'class' : (d) => d.clazz,
        d: (d) => d.d
      });
    }
    this.arr.forEach((o) => o.vis !== elem ? createLink(o.vis, elem) : null);

/*
    function createLinks(existing : any[], id : number, locs : geom.AShape[], $group: D3.Selection) {
      if (existing.length === 0) {
        return;
      }
      existing.forEach((ex) => {
        var swap = id > ex.id;
        var group = Math.min(id, ex.id)+'-'+Math.max(id, ex.id);
        var $g = $group.select('g[data-id="'+group+'"]');
        var links = [];
        locs.forEach((loc, i) => {
          if (loc && ex.locs[i]) {
            var cs = selectCorners(loc, ex.locs[i]);
            var r = [loc.corner(cs[0]), ex.locs[i].corner(cs[1])];
            links.push(swap ? r.reverse() : r);
          }
        });
        var $links = $g.selectAll('path').data(links);
        $links.enter().append('path').attr('class','select-selected');
        $links.exit().remove();
        $links.attr('d', (d) => {
          return line(d);
        });
      })
    }

    function addLinks(entry) {
      var $group = this.$svg.select('g[data-idtype="' + entry.idtype.name + '"]');
      if (entry.visses.length <= 1) { //no links between single item
        $group.selectAll('*').remove();
        return;
      }
      //collect all links
      var selected = entry.idtype.selections();
      if (selected.isNone) {
        $group.selectAll('*').remove();
        return;
      }
      console.log(entry.idtype.name, selected.toString());
      //prepare groups for all combinations
      prepareCombinations(entry, $group);

      //load and find the matching locations
      var loaded = [];
      entry.visses.forEach((entry) => {
        var id = entry.id;
        entry.vis.data.ids().then((ids) => {
          var dim = ids.dim(entry.dim);
          var locations = [], tolocate = [];
          selected.dim(0).iter().forEach((id) => {
            var mapped = dim.indexOf(id);
            if (mapped < 0) {
              locations.push(-1);
            } else {
              locations.push(tolocate.length);
              tolocate.push(ranges.list(mapped));
            }
          });
          if (tolocate.length === 0) {
            //no locations at all
            return;
          }
          //at least one mapped location
          entry.vis.locate.apply(entry.vis, tolocate).then((located) => {
            var fulllocations;
            if (tolocate.length === 1) {
              fulllocations = locations.map((index) => index < 0 ? undefined : located);
            } else {
              fulllocations = locations.map((index) => located[index]);
            }
            createLinks(loaded, id, fulllocations, $group);
            loaded.push({ id: id , locs: fulllocations});
          });
        });
      });
    }
*/
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
        this.render(elem.vis);
      }
    }
  }
  remove(elem: VisWrapper) {
    var index = this.arr.indexOf(elem);
    if (index >= 0) {
      this.arr.splice(index, 1);
      elem.callbacks.splice(elem.callbacks.indexOf(this.change), 1);
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
      })
    })
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


