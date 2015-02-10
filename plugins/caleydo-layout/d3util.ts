/**
 * Created by sam on 04.02.2015.
 */

import d3 = require('d3');
import layout = require('./main');
import geom = require('../caleydo/geom');
'use strict';

class SVGTransformLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
  constructor(private $elem: D3.Selection, private rawWidth: number, private rawHeight: number, options:any = {}) {
    super(options);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    var t = d3.transform(this.$elem.attr('transform'));
    t.translate.x = x;
    t.translate.y = y;
    t.scale.x = w / this.rawWidth;
    t.scale.y = h / this.rawHeight;
    this.$elem.attr('transform', t);
  }

  getBounds() {
    var t = d3.transform(this.$elem.attr('transform'));
    return geom.rect(t.translate.x, t.translate.y, this.rawWidth * t.scale.x, this.rawHeight * t.scale.y);
  }
}

class SVGRectLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
  constructor(private $elem: D3.Selection, options:any = {}) {
    super(options);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    this.$elem.attr({
      x : x,
      y: y,
      width: w,
      height: h
    });
  }

  getBounds() {
    return geom.rect(parseFloat(this.$elem.attr('x')), parseFloat(this.$elem.attr('y')), parseFloat(this.$elem.attr('width')), parseFloat(this.$elem.attr('height')));
  }
}

export function wrapSVGTransform($elem: D3.Selection, rawWidth: number, rawHeight: number, options:any = {}) {
  return new SVGTransformLayoutElem($elem, rawWidth, rawHeight, options);
}
export function wrapSVGRect($elem: D3.Selection, options:any = {}) {
  return new SVGRectLayoutElem($elem, options);
}
