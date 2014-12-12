/**
 * Created by Marc Streit on 01.09.2014.
 */
/* global define */
"use strict";
/**
 * a simple template for a visualization module
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/d3util', 'css!./style'], function (exports, d3, C, d3utils) {
  /**
   * a simple template class of a visualization. Up to now there is no additional logic required.
   * @param data
   * @param parent
   * @constructor
   */
  exports.Template = d3utils.defineVis('Template', {}, [100, 100], function ($parent, data, size) {
    var $svg = $parent.append('svg').attr({
      width: size[0],
      height: size[1],
      'class': 'template'
    });
    //do the magic
    return $svg;
  }, {
    locateIt : function (range) {
      return C.resolved({ x: 0, y: 0, w: 100, h: 100});
    }
  });

  /**
   * factory method of this module
   * @param data the data to show
   * @param parent the parent dom element to append
   * @returns {Vis} the visualization
   */
  exports.create = function (data, parent, options) {
    return new exports.Template(data, parent, options);
  };
});
