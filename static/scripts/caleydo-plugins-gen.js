/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(function () {
    var plugins = [
      {
        type: 'vis',
        name: 'heatmap',
        /**
         * icon of this vis type. Alternative: iconcss ... css class holding the icon
         * @default: none
         */
        icon: 'heatmap/icon.svg',
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
        icon: 'parco/icon.svg',
        size: function (dim) {
          return [360, 150];
        },
        filter: function (data) {
          return data.desc.type === 'table';
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
        type: 'vis',
        name: 'axis',
        icon: 'axis/icon.svg',
        size: function () {
          return [50, 300];
        },
        filter: function (data) {
          return data.desc.type === 'vector' && data.desc.value.type === 'real';
        }
      },
      {
        type: 'vis',
        name: 'lineup',
        size: function (dim) {
          return [Math.min(dim[1] * 100, 1000), Math.min(dim[0] * 20, 600)];
        },
        filter: function (data) {
          return data.desc.type === 'table';
        }
      },
      //{ //template for adding a new vis
      //  type: 'vis', //plugin type
      //  name: 'template', //unique id of a datatype
      //  size: function (dim) { //the size of the vis, given dattype.dim information -> [row,dim] in case of a matrix
      //    return [100,100];
      //  },
      //  filter: function (data) { //filter of a specific datatype, e.g. filter to specific types
      //    return data.desc.type === 'template';
      //  }
      //},
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
      //{ //template for adding a new data type
      //  type: 'datatype', //plugin type
      //  name: 'template', //unique id of a datatype
      //  module: './template-datatype' //module implementing this type
      //},
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
