/**
 * Created by sam on 16.02.2015.
 */

import C = require('../caleydo/main');
import link = require('./link');
import geom = require('../caleydo/geom');
import ranges = require('../caleydo/range');

console.log('loaded');

export function createBlockRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):C.IPromise<link.ILink[]> {
  var adim = a.dimOf(context.idtype),
    bdim = b.dimOf(context.idtype);
  return C.all([a.ids(), b.ids()]).then((ids) => {
    var ida:ranges.Range1D = ids[0].dim(adim);
    var idb:ranges.Range1D = ids[1].dim(bdim);
    return context.createBand(aa, bb, ida, idb, ida.intersect(idb), 'block', 'rel-block');
  });
}

function toArray(a : any) {
  if (!C.isArray(a)) {
    return [a];
  }
  return a;
}

export function createGroupRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):C.IPromise<link.ILink[]> {
  var adim = a.dimOf(context.idtype),
    bdim = b.dimOf(context.idtype);
  function toGroups(ids) {
    if (ids instanceof ranges.CompositeRange1D) {
      return (<ranges.CompositeRange1D>ids).groups;
    } else {
      return [ranges.asUngrouped(ids)];
    }
  }
  return C.all([a.ids(), b.ids()]).then((ids) => {
    var groupa : ranges.Range1DGroup[] = toGroups(ids[0].dim(adim));
    var groupb : ranges.Range1DGroup[] = toGroups(ids[1].dim(bdim));

    var ars = groupa.map((group) => {
      var r = ranges.all();
      r.dims[adim] = group;
      return r;
    });
    var brs = groupb.map((group) => {
      var r = ranges.all();
      r.dims[bdim] = group;
      return r;
    });
    return C.all([C.resolved({
      groupa : groupa,
      groupb : groupb
    }), a.locateById.apply(a, ars), b.locateById.apply(b, brs)]);
  }).then((data) => {
    function more(locs) {
      return (g,i) => { return {
        g : g,
        len : g.length,
        loc : locs[i] ? locs[i].aabb() : null
      }; };
    }
    var groupa = data[0].groupa.map(more(toArray(data[1])));
    var groupb = data[0].groupb.map(more(toArray(data[2])));
    var r = [];
    groupa.forEach((ga) => {
      groupb.forEach((gb) => {
        var int = ga.g.intersect(gb.g);
        var l = int.length;
        if (l === 0) {
          return;
        }
        var id = ga.g.name + '-' + gb.g.name;
        if (ga.loc && gb.loc) {
          r.push.apply(r, context.createBand(ga.loc, gb.loc, ga.g, gb.g, int, id, 'rel-group'));
          //shift the location for attaching
          ga.loc.y += ga.loc.h * (l / ga.len);
          gb.loc.y += gb.loc.h * (l / gb.len);
        }
      });
    });
    return r;
  });
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


export function createItemRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):C.IPromise<link.ILink[]> {
  var adim = a.dimOf(context.idtype),
    bdim = b.dimOf(context.idtype),
    amulti = a.data.dim.length > 1,
    bmulti = b.data.dim.length > 1;

  function toPoint(loc, other, multi) {
    if (!multi) {
      return loc.center;
    }
    var c = selectCorners(loc, other);
    return loc.corner(c[0]);
  }
  return C.all([a.ids(), b.ids()]).then((ids) => {
    var ida:ranges.Range1D = ids[0].dim(adim);
    var idb:ranges.Range1D = ids[1].dim(bdim);
    var union = ida.intersect(idb);
    var ars = [], brs = [];
    union.forEach((index) => {
      var r = ranges.all();
      r.dim(adim).setList([index]);
      ars.push(r);

      r = ranges.all();
      r.dim(bdim).setList([index]);
      brs.push(r);
    });
    return C.all([C.resolved(union), a.locateById.apply(a, ars), b.locateById.apply(b, brs)]);
  }).then((locations) => {
    var union = locations[0],
      loca = toArray(locations[1]),
      locb = toArray(locations[2]);
    var r = [];
    context.line.interpolate('linear');
    var selections = context.idtype.selections().dim(0);
    union.forEach((id, i) => {
      var la = geom.wrap(loca[i]);
      var lb = geom.wrap(locb[i]);
      if (la && lb) {
        r.push({
          clazz: 'rel-item' + (selections.contains(id) ? ' select-selected' : ''),
          id: id,
          d: context.line([toPoint(la, lb, amulti), toPoint(lb, la, bmulti)])
        });
      } //TODO optimize use the native select to just update the classes and not recreate them
    });
    return r;
  });
}
