/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', 'd3.parcoords', '../caleydo'], function (exports, d3, d3_parcoords, C) {
  function ParCo(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  ParCo.prototype.build = function ($parent) {
    var $base = $parent.append('div').attr({
      'class': 'parcoords',
      style: 'width:360px;height:150px'
    });

    this.data.data().then(function (arr) {

      var pc = d3_parcoords()($base.node())
        .data(arr)
        .render()
        .ticks(3)
        .createAxes();

    });

    return $base.node();
  };
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
