/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', '../caleydo', '../caleydo-d3utils'], function (exports, d3, C, utils) {
  function ParCo(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  ParCo.prototype.build = function ($parent) {
    var $base = $parent.append('div').attr({
      'class': 'vector'
    });
    var onClick = utils.selectionUtil(this.data, $base, 'div');
    this.data.data().then(function (v) {
      var $v = $base.selectAll('div').data(v);
      $v.enter().append('div').on('click', onClick).text(C.identity);
    });

    return $base.node();
  };
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
