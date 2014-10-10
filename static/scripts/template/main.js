/**
 * Created by Marc Streit on 01.09.2014.
 */

/**
 * a simple template for a visualization module
 */
define(['exports', 'd3', 'css!./style'], function (exports, d3) {
  /**
   * a simple template class of a visualization. Up to now there is no additional logic required.
   * @param data
   * @param parent
   * @constructor
   */
  function Template(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  Template.prototype.build = function ($parent) {
    var w = 100, h  = 100;
    var $svg = $parent.append('svg').attr({
      width: w,
      height: h,
      'class': 'template'
    });
    //do the magic
    return $svg.node();
  };
  exports.Template = Template;

  /**
   * factory method of this module
   * @param data the data to show
   * @param parent the parent dom element to append
   * @returns {Template} the visualization
   */
  function create(data, parent) {
    return new Template(data, parent);
  }

  exports.create = create;
});
