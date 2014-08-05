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

      var data = [
        [0,-0,0,0,0,3 ],
        [1,-1,1,2,1,6 ],
        [2,-2,4,4,0.5,2],
        [3,-3,9,6,0.33,4],
        [4,-4,16,8,0.25,9]
      ];

      var pc = d3_parcoords()('#example')
        .data(data)
        .render()
        .ticks(3)
        .createAxes();
    };
    return ParCo;
  })();
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
