/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3', '../caleydo', 'lineupjs', 'css!./style'], function (exports, d3, C, LineUpJS) {
  function LineUp(data, parent) {
    this.data = data;
    this.parent = parent;

    this.node = this.build(d3.select(parent));
  }

  function deriveColumns(columns) {
    return columns.map(function (col) {
      var r = {
        column : col.desc.name
      };
      var val = col.desc.value;
      switch (val.type) {
      case 'string':
      case 'categorical':
        r.type = 'string';
        break;
      case 'real':
      case 'int':
        r.type = 'number';
        r.domain = val.range;
        break;
      default:
        r.type = 'string';
        break;
      }
      return r;
    });
  }

  LineUp.prototype.build = function ($parent) {
    var width = 800, height = 300;

    var $div = $parent.append('div').classed('lineup', true);

    var that = this;

    var columns = deriveColumns(this.data.cols());
    // bind data to chart
    C.all([this.data.objects(), this.data.rows()]).then(function (promise) {
      var arr = promise[0];
      var rowNames = promise[1];
      var data = arr.map(function (obj, i) {
        return C.mixin({
          _id : rowNames[i]
        }, obj);
      });
      that.lineup = LineUpJS.create(LineUpJS.createLocalStorage(data, columns, null, '_id'), $div);
      that.lineup.startVis();
    });
    return $div.node();
  };
  exports.LineUp = LineUp;

  exports.create = function (data, parent) {
    return new LineUp(data, parent);
  };
});
