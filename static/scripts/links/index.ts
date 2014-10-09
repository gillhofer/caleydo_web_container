/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />

import d3 = require('d3');
import geom = require('../caleydo-geom');
import ranges = require('../caleydo-range');
import C = require('../caleydo');

var _id = 0, line = d3.svg.line().x((d) => d.x).y((d) => d.y);
function nextID() {
  return _id++;
}

export class LinksRenderer {
  private $parent: D3.Selection;
  private $div: D3.Selection;
  private $svg : D3.Selection;
  private visses = [];
  private observing = d3.map();

  constructor(parent) {
    this.$parent = d3.select(parent);
    this.$div = this.$parent.append('div').attr({
      'class': 'layer layer1 links'
    });
    this.$svg = this.$div.append("svg").attr({
      width: '100%',
      height: '100%'
    });
  }

  register(idtype) {
    var that = this;
    function l() {
      that.update(idtype);
    }

    idtype.on('select', l);
    return {
      idtype: idtype,
      l: l,
      visses: [],
      push: function (vis, dimension) {
        this.visses.push({ vis: vis, dim: dimension, id: nextID()});
      },
      remove: function (vis) {
        var i, v = this.visses;
        for (i = v.length - 1; i >= 0; --i) {
          if (v[i].vis === vis) {
            v.splice(i, 1);
          }
        }
      }
    };
  }

  unregister(entry) {
    var idtype = entry.idtype;
    idtype.off('select', entry.l);
  }

  push(vis) {
    this.visses.push(vis);
    var observing = this.observing;
    //register to all idtypes
    vis.data.idtypes.forEach((idtype, i) => {
      if (observing.has(idtype.name)) {
        observing.get(idtype.name).push(vis, i);
      } else {
        var r = this.register(idtype);
        r.push(vis, i);
        observing.set(idtype.name, r);
        this.updateIDTypes();
      }
    });
    this.update();
  }

  remove(vis) {
    var i = this.visses.indexOf(vis);
    if (i >= 0) {
      this.visses.splice(i, 1);
    }
    var observing = this.observing;
    vis.data.idtypes.forEach((idtype) => {
      var r = observing.get(idtype.name);
      r.remove(vis);
      if (r.visses.length === 0) { //no more reference, we can unregister it
        this.unregister(r);
        observing.remove(idtype.name);
        this.updateIDTypes();
      }
    });
    this.update();
  }

  update(idtype?: any) {
    function prepareCombinations(entry, $group) {
      var combinations = [];
      var l = entry.visses.length, i, j, a,b;
      for (i = 0; i < l; ++i) {
        a = entry.visses[i].id;
        for (j = 0; j < i; ++j) {
          b = entry.visses[j].id;
          combinations.push(Math.min(a,b)+'-'+Math.max(a,b));
        }
      }
      var $combi = $group.selectAll('g').data(combinations);
      $combi.enter().append('g');
      $combi.exit().remove();
      $combi.attr('data-id', C.identity);
    }

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
            var r = [loc.center, ex.locs[i].center];
            links.push(swap ? r.reverse() : r);
          }
        });
        var $links = $g.selectAll('path').data(links);
        $links.enter().append('path');
        $links.exit().remove();
        $links.attr('d', (d) => {
          return line(d);
        });
      })
    }

    function addLinks(entry) {
      if (entry.visses.length <= 1) { //no links between single items
        return;
      }
      //collect all links
      var selected = entry.idtype.selections();
      var $group = this.$svg.select('g[data-idtype="' + entry.idtype.name + '"]');
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

    if (idtype) {
      addLinks.call(this, this.observing.get(idtype.name));
    } else {
      this.observing.values().forEach(addLinks, this);
    }
  }

  updateIDTypes() {
    var $g = this.$svg.selectAll('g').data(this.observing.values());
    $g.enter().append('g');
    $g.exit().remove();
    $g.attr('data-idtype', function (d) {
      return d.idtype.name;
    });
  }
}
export function create(parent) {
  return new LinksRenderer(parent);
}
