/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
import C = require('./main');
import idtypes = require('./idtype');
import datatype = require('./datatype');
import vis = require('./vis');
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

export function defineVis(name: string, defaultOptions : any, build : ($parent: D3.Selection, data?: datatype.IDataType) => D3.Selection, functions?: any);
export function defineVis(name: string, defaultOptions : (data: datatype.IDataType, options: any) => any, build : ($parent: D3.Selection, data?: datatype.IDataType) => D3.Selection, functions?: any);
export function defineVis(name: string, defaultOptions : any, build : ($parent: D3.Selection, data?: datatype.IDataType) => D3.Selection, functions?: any) {
  function VisTechnique(data: datatype.IDataType, parent: Element, options: any) {
    vis.AVisInstance.call(this, data, parent, options);
    this.data = data;
    this.$parent = d3.select(parent);
    this.options = C.mixin(d3.functor(defaultOptions).call(this,data, options || {}), options);
    this.$node = build.call(this, this.$parent, this.data);
    if (C.isFunction(this.init)) {
      this.init(data);
    }
  }
  C.extendClass(VisTechnique, vis.AVisInstance);
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
    var bak = {
      scale: this.options.scale || [1,1],
      rotate: this.options.rotate || 0
    };
    if (arguments.length === 0) {
      return bak;
    }
    this.$node.attr({
      width: this.options.width * scale[0],
      height: this.options.height * scale[1]
    }).style('transform','rotate('+rotate+'deg)');
    this.$node.select('g').attr('transform','scale('+scale[0]+','+scale[1]+')');

    var new_ = {
      scale: scale,
      rotate: rotate
    };
    this.fire('transform',new_, bak);
    this.options.scale = scale;
    this.options.rotate = rotate;
    return new_;
  };
  VisTechnique.prototype.locateImpl = function(range) {
    var r = this.locateIt(range);
    if (!r) {
      return null;
    }
    var that = this;
    return r.then((shape) => {
      shape = geom.wrap(shape);
      return shape ? shape.transform(that.options.scale || [1,1], that.options.rotate || 0) : shape;
    });
  };
  VisTechnique.prototype.locateIt = function(range) {
    return null;
  };
  VisTechnique.prototype = C.mixin(VisTechnique.prototype, functions);

  Object.defineProperty(VisTechnique.prototype,'node', {
    get : () => this.$node.node(),
    enumerable: true
  });
  return VisTechnique;
}
