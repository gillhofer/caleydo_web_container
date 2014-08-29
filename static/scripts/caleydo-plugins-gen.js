/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(function () {
    var plugins = [
      {
        type: 'vis',
        name: 'heatmap',
        /**
         * optional function returning the expected size of the vis given the dimension (nrow,ncol) of the represented data
         * default unknown
         * @param dim array containing the data dimensions returned by IDataType.dim
         * @returns {*[]}
         */
        size: function (dim) {
          return [dim[1] * 10, dim[0] * 10];
        },
        /**
         * optional filter for which this vis can be applied, given an IDataType
         * default: all
         * @param data
         * @returns {boolean}
         */
        filter: function (data) {
          return data.desc.type === 'matrix';
        }
      },
      {
        type: 'vis',
        name: 'table',
        size: function (dim) {
          return [dim[1] * 110, dim[0] * 22];
        }
      },
      {
        type: 'vis',
        name: 'parco',
        size: function (dim) {
          return [360, 150];
        }
      },
      {
        type: 'vis',
        name: 'scatterplot',
        size: function () {
          return [300, 300 + 40];
        },
        filter: function (data) {
          return data.desc.type === 'matrix';
        }
      },
      {
        type: 'vis',
        name: 'box',
        size: function () {
          return [300, 50];
        },
        filter: function (data) {
          return data.desc.type === 'vector' && data.desc.value.type === 'real';
        }
      },
      {
        type: 'autoload',
        name: 'links'
      },
      {
        type: 'datatype',
        name: 'matrix',
        module: './caleydo-matrix'
      },
      {
        type: 'datatype',
        name: 'table',
        module: './caleydo-table'
      },
      {
        type: 'datatype',
        name: 'vector',
        module: './caleydo-vector'
      },
      {
        type: 'ui',
        name: 'tooltip'
      },
      {
        type: 'ui',
        name: 'window'
      }
    ];
    return {
      plugins: plugins
    };
  }
);
