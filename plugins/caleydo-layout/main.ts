/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import C = require('../caleydo/main');
import _2D = require('../caleydo/2D');
import plugins = require('../caleydo/plugin');

export interface ILayoutElem {
  setBounds(x:number, y:number, w:number, h:number);

  getLocation(): _2D.Vector2D;
  getSize(): _2D.Vector2D;

  option<T>(name:string) : T;
  option<T>(name:string, default_:T) : T;
}

export class ALayoutElem {
  constructor(private options:any = {}) {

  }

  getBounds() {
    return {x: 0, y: 0, w: 0, h: 0};
  }

  getLocation() {
    return _2D.vec(this.getBounds());
  }

  getSize() {
    var b = this.getBounds();
    return _2D.vec(b.w, b.h);
  }

  option<T>(name:string, default_:T = null):T {
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
    var unit = this.option('unit', 'px'),
      style = this.node.style;
    style.left = x + unit;
    style.top = y + unit;
    style.width = w + unit;
    style.height = h + unit;
  }

  getBounds() {
    var unit = this.option('unit', 'px'),
      style = this.node.style;
    function v(f: string) {
      if (f.length >= unit.length && f.substring(f.length-unit.length) === unit) {
        f = f.substring(0, f.length-unit.length);
        return parseFloat(f);
      }
      return 0;
    }
    return {
      x : v(style.left),
      y : v(style.top),
      w : v(style.width),
      h: v(style.height)
    };
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
    var x = grab(elem.option('prefX', Number.NaN), 0);
    var y = grab(elem.option('prefY', Number.NaN), 0);
    elem.setBounds(x, y, w - x, h - y);
  });
  return false;
}

export function flowLayout(horizontal:boolean, gap:number, padding = {top: 0, left: 0, right: 0, bottom: 0}) {
  function setSize(w:number, h:number, child:ILayoutElem, value:number) {
    var loc = child.getLocation();
    if (horizontal)
      child.setBounds(loc.x, loc.y, value, grab(child.option('prefHeight', Number.NaN), h));
    else
      child.setBounds(loc.x, loc.y, grab(child.option('prefWidth', Number.NaN), w), value);
  }

  function FlowLayout(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
    w -= padding.left + padding.right;
    h -= padding.top + padding.bottom;
    var freeSpace = (horizontal ? w : h) - gap * (elems.length - 1);
    var unbound = 0, fixUsed = 0, ratioSum = 0;

    // count statistics
    elems.forEach((elem) => {
      var fix = elem.option(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      var ratio = elem.option('ratio', Number.NaN);
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
      var fix = elem.option(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      var ratio = elem.option('ratio', Number.NaN);
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
      var s = elem.getSize();
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

export function distributeLayout(horizontal:boolean, defaultValue:number, padding = {top: 0, left: 0, right: 0, bottom: 0}) {
  function setBounds(x, y, w:number, h:number, child:ILayoutElem, value:number) {
    if (horizontal)
      child.setBounds(x, y, value, grab(child.option('prefHeight', Number.NaN), h));
    else
      child.setBounds(x, y, grab(child.option('prefWidth', Number.NaN), w), value);
  }

  function DistributeLayout(elems:ILayoutElem[], w:number, h:number, parent:ILayoutElem) {
    w -= padding.left + padding.right;
    h -= padding.top + padding.bottom;
    var freeSpace = (horizontal ? w : h);
    var fixUsed = 0;

    // count statistics
    elems.forEach((elem) => {
      var fix = elem.option(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
      if (isDefault(fix)) {
        fix = defaultValue;
      }
      fixUsed += fix;
    });

    var gap = (freeSpace - fixUsed) / (elems.length-1);

    var x_acc = padding.left;
    var y_acc = padding.top;
    elems.forEach((elem) => {
      var fix = elem.option(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
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

