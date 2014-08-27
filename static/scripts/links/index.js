/**
 * Created by Marc Streit on 15.08.2014.
 */
define(['exports', 'd3', 'css!./links_style'], function (exports, d3) {
  var LinksRenderer = (function () {
    function LinksRenderer(parent) {
      this.$parent = d3.select(parent);
      this.$div = this.$parent.append('div').attr({
        'class': 'layer layer1'
      });
      this.$svg = this.$div.append("svg").attr({
        width: '100%',
        height: '100%'
      });
    }
    return LinksRenderer;
  }());
  exports.LinksRenderer = LinksRenderer;

  function create(parent) {
    return new LinksRenderer(parent);
  }

  exports.create = create;
});
