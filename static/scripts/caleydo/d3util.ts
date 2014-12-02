/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
import C = require('./main');
import idtypes = require('./idtype');
import datatype = require('./datatype');
import plugins = require('./plugin');
import geom = require('./geom');
import d3 = require('d3');
'use strict';

/**
 * utility function to handle selections
 * @param data
 * @param $data
 * @param selector what type of object are the data bound ot
 * @returns {function(any, any): undefined} the click handler
 */
export function selectionUtil(data: datatype.IDataType, $data : D3.Selection, selector : string) {
  var l = function (event, type, selected) {
    var all = $data.selectAll(selector);
    all.classed('select-' + type, false);
    var sub = selected.filter(all[0]);
    if (sub.length > 0) {
      d3.selectAll(sub).classed('select-' + type, true);
    }
  };
  data.on('select', l);
  C.onDOMNodeRemoved($data.node(), function () {
    data.off('select', l);
  });
  data.selections().then(function (selected) {
    l(null, 'selected', selected);
  });

  return (d, i) => {
    data.select(0, [i], idtypes.toSelectOperation(d3.event));
  }
}

export function defineVis(name: string, defaultOptions : any, build : ($parent: D3.Selection, data: datatype.IDataType) => D3.Selection, functions?: any);
export function defineVis(name: string, defaultOptions : (data: datatype.IDataType, options: any) => any, build : ($parent: D3.Selection, data: datatype.IDataType) => D3.Selection, functions?: any);
export function defineVis(name: string, defaultOptions : any, build : ($parent: D3.Selection, data: datatype.IDataType) => D3.Selection, functions?: any) {
  function VisTechnique(data: datatype.IDataType, parent: Element, options: any) {
    this.data = data;
    this.$parent = d3.select(parent);
    this.options = C.mixin(d3.functor(defaultOptions).call(this,data, options || {}), options);
    this.$node = build.call(this.$parentm, this.data);
    if (C.isFunction(this.init)) {
      this.init(data);
    }
  }
  C.extendClass(VisTechnique, plugins.AVisInstance);
  Object.defineProperty(VisTechnique.prototype,'node', {
    get : () => this.$node.node(),
    enumerable: true
  });
  VisTechnique.prototype.toString = () => name;
  VisTechnique.prototype.option = function(name, value) {
    if (arguments.length === 1) {
      return this.options[name];
    } else {
      var b = this.options[name];
      this.fire('option.'+name,value, b);
      this.options[name] = value;
      this.updatedOption(name, value);
      return b;
    }
  };
  VisTechnique.prototype.updatedOption = function(name, value) {
  };
  VisTechnique.prototype.transform = function(scale, rotate) {
    this.$node.attr({
      width: this.options.width * scale[0],
      height: this.options.height * scale[1]
    }).style('transform','rotate('+rotate+'deg)');
    this.$node.select('g').attr('transform','scale('+scale[0]+','+scale[1]+')');
    this.fire('transform',{
      scale: scale,
      rotate: rotate
    });
    this.options.scale = scale;
    this.options.rotate = rotate;
  };
  VisTechnique.prototype.locateImpl = function(range) {
    var r = this.locateIt(range);
    if (!r) {
      return null;
    }
    return r.then((shape) => {
      shape = geom.wrap(r);
      return shape ? shape.transform(this.options.scale || [1,1], this.options.rotate || 0) : shape;
    });
  };
  VisTechnique.prototype.locateIt = function(range) {
    return null;
  };
  VisTechnique.prototype = C.mixin(VisTechnique.prototype, functions);
  return VisTechnique;
}
