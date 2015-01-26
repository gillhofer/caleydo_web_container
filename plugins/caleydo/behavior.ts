/**
 * Created by Samuel Gratzl on 16.12.2014.
 */

import vis = require('./vis');
import events = require('./event');

export class ZoomBehavior extends events.EventHandler {
  constructor(private node: Element, public v: vis.IVisInstance, public meta : vis.IVisMetaData) {
    super();
    node.addEventListener('mousewheel', (event : any) => {
      if (!this.v) {
        return;
      }
      var ctrlKey = event.ctrlKey;
      var shiftKey = event.shiftKey;
      var altKey = event.altKey;
      var m = event.wheelDelta;
      this.zoom(m * (ctrlKey || altKey ? 1: 0), m * (ctrlKey || shiftKey ? 1 : 0));
      if (ctrlKey || shiftKey || altKey) {
        event.preventDefault();
      }
    });
  }

  zoomIn() {
    return this.zoom(1,1);
  }
  zoomOut() {
    return this.zoom(-1,-1);
  }

  zoom (zoomX: number, zoomY : number) {
    if (!this.v) {
      return null;
    }
    function toDelta(x) {
      return x > 0 ? 0.2 : (x < 0 ? -0.2 : 0);
    }
    var old = this.v.transform();
    var deltaX = toDelta(zoomX);
    var deltaY = toDelta(zoomY);
    return this.zoomSet(old.scale[0] + deltaX, old.scale[1] + deltaY);
  }

  zoomSet(zoomX : number, zoomY : number) {
    if (!this.v) {
      return null;
    }
    var old = this.v.transform();
    var s = [zoomX, zoomY];
    switch((this.meta ? this.meta.scaling : 'free')) {
      case 'width-only':
        s[1] = old.scale[1];
        break;
      case 'height-only':
        s[0] = old.scale[0];
        break;
    }
    if (s[0] <= 0) {
      s[0] = 0.001;
    }
    if (s[1] <= 0) {
      s[1] = 0.001;
    }
    this.fire('zoom', {
      scale : s,
      rotate: old.rotate
    }, old);
    return this.v.transform(s, old.rotate);
  }

  zoomTo(w : number, h : number) {
    if (!this.v) {
      return null;
    }
    var ori = this.v.rawSize;
    return this.zoomSet(w / ori[0], h/ori[1]);
  }
}