/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(['exports', 'd3', '../caleydo', '../caleydo-idtypes'], function (exports, d3, C, idtypes) {
  function ParCo(data, parent) {
    this.data = data;
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  ParCo.prototype.build = function ($parent) {
    var $base = $parent.append('div').attr({
      'class': 'vector'
    });
    var data = this.data;
    data.data().then(function (v) {
      var $v = $base.selectAll('div').data(v);
      $v.enter().append('div').on('click', function (d, i) {
        data.select([i], idtypes.toSelectOperation(d3.event));
      }).text(C.identity);
    });
    var l = function (event, type, selected) {
      $base.selectAll('div').classed('select-' + type, false);
      selected.dim(0).forEach(function (i) {
        $base.select('div:nth-child(' + (i + 1) + ')').classed('select-' + type, true);
      });
    };
    data.on('select', l);
    C.onDOMNodeRemoved($base.node(), function () {
      data.off('select', l);
    });
    data.selections().then(function (selected) {
      l(null, 'selected', selected);
    });

    return $base.node();
  };
  exports.ParCo = ParCo;

  function create(data, parent) {
    return new ParCo(data, parent);
  }

  exports.create = create;
});
