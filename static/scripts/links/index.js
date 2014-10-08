/**
 * Created by Marc Streit on 15.08.2014.
 */
define(['exports', 'd3', '../caleydo-geom', 'css!./links_style'], function (exports, d3) {
  function LinksRenderer(parent) {
    this.$parent = d3.select(parent);
    this.$div = this.$parent.append('div').attr({
      'class': 'layer layer1'
    });
    this.$svg = this.$div.append("svg").attr({
      width: '100%',
      height: '100%'
    });
    this.visses = [];
  }

  LinksRenderer.prototype.push = function (vis) {
    this.visses.push(vis);
    //TODO register to all new idtypes
    this.update();
  };
  LinksRenderer.prototype.remove = function (vis) {
    var i = this.visses.indexOf(vis);
    if(i >= 0) {
      this.visses.splice(i,1);
    }
    //TODO unregister stuff;
    this.update();
  };
  LinksRenderer.prototype.update = function () {
    
  };

  exports.LinksRenderer = LinksRenderer;

  exports.create = function (parent) {
    return new LinksRenderer(parent);
  };
});
