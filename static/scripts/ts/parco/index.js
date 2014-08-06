/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', 'd3.parcoords', '../caleydo'], function (exports, d3, d3_parcoords, C) {
  var ParCo = (function () {
    function ParCo(data, parent) {
      this.data = data;
      this.parent = parent;
      this.build(d3.select(parent));
    }

    ParCo.prototype.build = function ($parent) {
      var dims = this.data.dim;
      var width = dims[1], height = dims[0];
      var $svg = $parent.append('div').attr({
        'class': 'parcoords',
        id: 'example',
        style: 'width:360px;height:150px'
      });

      this.data.data().then(function (arr) {
        var pc = d3_parcoords()("#example")
          .data(arr)
          .render()
          .ticks(3)
          .createAxes()
          .reorderable()
          .brushable()
          .interactive();
      });
    };
    return ParCo;
  })();
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
