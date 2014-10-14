/**
 * Created by Marc Streit on 01.09.2014.
 */
/* global define */
"use strict";
/**
 * a simple template for a visualization module
 */
define(['exports', 'd3', '../caleydo/main', 'css!./style'], function (exports, d3, C) {
  /**
   * a simple template class of a visualization. Up to now there is no additional logic required.
   * @param data
   * @param parent
   * @constructor
   */
  function Vis(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  Vis.prototype.build = function ($parent) {
    var w = 100, h = 100;
    var $svg = $parent.append('svg').attr({
      width: w,
      height: h,
      'class': 'template'
    });
    //do the magic
    return $svg.node();
  };

  /**
   * locate the given range(s) of data item in this vis returning an geometric object (see caleydo/geom) as a promise
   * @param range
   * @returns {C.IPromise<any>}
   */
  Vis.prototype.locate = function (range) {
    switch (arguments.length) {
    case 0:
      //return the area where the elements are shown
      return C.resolved({ x: 0, y: 0, w: 100, h: 100});
    case 1:
      //return the location of one specific range
      return this.locateImpl(range);
    default:
      //return a bunch of locations at ones
      return C.all(Array.prototype.slice.call(arguments).map(this.locateImpl, this));
    }
  };

  /**
   * locate the given range within the visualization
   * @param range {ranges.Range}
   * @returns {C.IPromise<any>}
   */
  Vis.prototype.locateImpl = function (range) {
    return C.resolved({ x: 0, y: 0, w: 100, h: 100});
  };


  exports.Template = Vis;

  /**
   * factory method of this module
   * @param data the data to show
   * @param parent the parent dom element to append
   * @returns {Vis} the visualization
   */
  function create(data, parent) {
    return new Vis(data, parent);
  }

  exports.create = create;
});
