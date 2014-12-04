/**
 * Created by Marc Streit on 06.08.2014.
 */
define(['exports', 'd3', '../caleydo/main', 'lineupjs', '../caleydo/d3util', 'css!./style'], function (exports, d3, C, LineUpJS, d3utils) {
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

  exports.LineUp = d3utils.defineVis('LineUp', {}, function build($parent) {
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
    return $div;
  }, {
    transform: function (scale, rotate) {
      this.$node.style('transform', 'rotate(' + rotate + 'deg)scale(' + scale[0] + ',' + scale[1] + ')');
      this.fire('transform', {
        scale: scale,
        rotate: rotate
      });
      this.options.scale = scale;
      this.options.rotate = rotate;
    }
  });

  exports.create = function (data, parent, options) {
    return exports.LineUp(data, parent, options);
  };
});
