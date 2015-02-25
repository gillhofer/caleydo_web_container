/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import geom = require('../caleydo/geom');

export interface ILayoutElem {
  setBounds(x:number, y:number, w:number, h:number);

  getBounds(): geom.Rect;

  layoutOption<T>(name:string) : T;
  layoutOption<T>(name:string, default_:T) : T;
}

export class ALayoutElem {
  constructor(private options:any = {}) {

  }

  getBounds(): geom.Rect {
    return geom.rect(0,0,0,0);
  }

  getLocation() {
    return this.getBounds().xy;
  }

  getSize() {
    return this.getBounds().size;
  }

  layoutOption<T>(name:string, default_:T = null):T {
    if (this.options.hasOwnProperty(name)) {
      return this.options[name];
    }
    return default_;
  }
}

class HTMLLayoutElem extends ALayoutElem implements ILayoutElem {
  constructor(private node:HTMLElement, options:any = {}) {
    super(options);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    var unit = this.layoutOption('unit', 'px'),
      style = this.node.style;
    style.left = x + unit;
    style.top = y + unit;
    style.width = w + unit;
    style.height = h + unit;
  }

  getBounds() {
    var unit = this.layoutOption('unit', 'px'),
      style = this.node.style;
    function v(f: string) {
      if (f.length >= unit.length && f.substring(f.length-unit.length) === unit) {
        f = f.substring(0, f.length-unit.length);
        return parseFloat(f);
      }
      return 0;
    }
    return geom.rect(v(style.left),v(style.top), v(style.width),v(style.height));
  }
}

export function wrapDOM(node:HTMLElement,options:any = {}) {
  return new HTMLLayoutElem(node, options);
}

export interface IPadding {
  top: number;
  left: number;
  right: number;
  bottom : number;
}

export var no_padding = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

export interface ILayout {
  (elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) : boolean;
}

function isDefault(v:number) {
  return v < 0 || isNaN(v);
}

function grab(v_def:number, v:number) {
  return isDefault(v_def) ? v : v_def;
}

export function layers(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
  elems.forEach((elem) => {
    var x = grab(elem.layoutOption('prefX', Number.NaN), 0);
    var y = grab(elem.layoutOption('prefY', Number.NaN), 0);
    elem.setBounds(x, y, w - x, h - y);
  });
  return false;
}

export function flowLayout(horizontal:boolean, gap:number, padding = {top: 0, left: 0, right: 0, bottom: 0}) {
  function setSize(w:number, h:number, child:ILayoutElem, value:number) {
    var loc = child.getBounds().xy;
    if (horizontal) {
      child.setBounds(loc.x, loc.y, value, grab(child.layoutOption('prefHeight', Number.NaN), h));
    } else {
      child.setBounds(loc.x, loc.y, grab(child.layoutOption('prefWidth', Number.NaN), w), value);
    }
  }

  function FlowLayout(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
    w -= padding.left + padding.right;
    h -= padding.top + padding.bottom;
    var freeSpace = (horizontal ? w : h) - gap * (elems.length - 1);
    var unbound = 0, fixUsed = 0, ratioSum = 0;

    // count statistics
    elems.forEach((elem) => {
      var fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      var ratio = elem.layoutOption('ratio', Number.NaN);
      if (isDefault(fix) && isDefault(ratio)) {
        unbound++;
      } else if (fix >= 0) {
        fixUsed += fix;
      } else {
        ratioSum += ratio;
      }
    });

    var ratioMax = (ratioSum < 1) ? 1 : ratioSum;
    var unboundedSpace = (freeSpace - fixUsed - freeSpace * ratioSum / ratioMax) / unbound;

    // set all sizes
    elems.forEach((elem) => {
      var fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      var ratio = elem.layoutOption('ratio', Number.NaN);
      if (isDefault(fix) && isDefault(ratio)) {
        setSize(w, h, elem, unboundedSpace);
      } else if (fix >= 0) {
        setSize(w, h, elem, fix);
      } else { // (ratio > 0)
        var value = (ratio / ratioMax) * freeSpace;
        setSize(w, h, elem, value);
      }
    });
    // set all locations
    var x_acc = padding.left;
    var y_acc = padding.top;
    elems.forEach((elem) => {
      var s = elem.getBounds().size;
      elem.setBounds(x_acc, y_acc, s.x, s.y);
      if (horizontal) {
        x_acc += s.x + gap;
      } else {
        y_acc += s.y + gap;
      }
    });
    return false;
  }

  return FlowLayout;
}

export function distributeLayout(horizontal:boolean, defaultValue:number, padding = no_padding) {
  function setBounds(x, y, w:number, h:number, child:ILayoutElem, value:number) {
    if (horizontal) {
      child.setBounds(x, y, value, grab(child.layoutOption('prefHeight', Number.NaN), h));
    } else {
      child.setBounds(x, y, grab(child.layoutOption('prefWidth', Number.NaN), w), value);
    }
  }

  function DistributeLayout(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
    w -= padding.left + padding.right;
    h -= padding.top + padding.bottom;
    var freeSpace = (horizontal ? w : h);
    var fixUsed = 0;

    // count statistics
    elems.forEach((elem) => {
      var fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      if (isDefault(fix)) {
        fix = defaultValue;
      }
      fixUsed += fix;
    });

    var gap = (freeSpace - fixUsed) / (elems.length-1);

    var x_acc = padding.left;
    var y_acc = padding.top;

    if (elems.length === 1) { //center the single one
      if (horizontal) {
        x_acc += (freeSpace-fixUsed) / 2;
      } else {
        y_acc += (freeSpace-fixUsed) / 2;
      }
    }

    elems.forEach((elem) => {
      var fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      if (isDefault(fix)) {
        fix = defaultValue;
      }
      setBounds(x_acc, y_acc, w, h, elem, fix);
      if (horizontal) {
        x_acc += fix + gap;
      } else {
        y_acc += fix + gap;
      }
    });
    return false;
  }

  return DistributeLayout;
}

//     top
//------------
// l |      | r
// e |      | i
// f |center| g
// t |      | h
//   |      | t
//-------------
//   bottom

export function borderLayout(horizontal:boolean, gap:number, percentages = { top: 0.2, left: 0.2, right: 0.2, bottom: 0.2 }, padding : IPadding  = no_padding) {
  function BorderLayout(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
    w -= padding.left + padding.right;
    h -= padding.top + padding.bottom;
    var x = padding.top, y = padding.left, wc = w, hc = h;
    var pos = {
      top: [],
      center : [],
      left : [],
      right: [],
      bottom : []
    };
    elems.forEach((elem) => {
      var border = elem.layoutOption('border', 'center');
      if (!pos.hasOwnProperty(border)) {
        border = 'center'; //invalid one
      }
      pos[border].push(pos);
    });

    if (pos.top.length > 0) {
      y += h * percentages.top;
      hc -= h*percentages.top;
      flowLayout(true, gap)(pos.top, w, h * percentages.top, parent);
    }
    if (pos.bottom.length > 0) {
      hc -= h*percentages.bottom;
      flowLayout(true, gap)(pos.bottom, w, h * percentages.bottom, parent);
    }
    if (pos.left.length > 0) {
      x += w * percentages.left;
      wc -= w * percentages.left;
      flowLayout(false, gap)(pos.left, w * percentages.left, hc, parent);
    }
    if (pos.right.length > 0) {
      wc -= w * percentages.right;
      flowLayout(false, gap)(pos.right, w * percentages.right, hc, parent);
    }
    if (pos.center.length > 0) {
      flowLayout(true, gap)(pos.center, wc, hc, parent);
    }
  }

  return BorderLayout;
}
