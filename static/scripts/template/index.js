/**
 * Created by Marc Streit on 06.08.2014.
 */
//request d3, and my style
define(['exports', 'd3', 'css!./style'], function (exports, d3) {
  function Template(data, parent) {
    this.data = data;
    this.parent = parent;
    this.build(d3.select(parent));
  }

  Template.prototype.build = function ($parent) {
    var w = 100, h  = 100;
    var $svg = $parent.append("svg").attr({
      width: w,
      height: h,
      'class': 'template'
    });
    //do the magic
  };
  exports.Template = Template;

  function create(data, parent) {
    return new Template(data, parent);
  }

  exports.create = create;
});
