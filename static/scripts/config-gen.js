/*global require */
require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '/bower_components/jquery/jquery',
    'jquery-ui': '/bower_components/jquery-ui/ui/jquery-ui',
    d3: '/bower_components/d3/d3',
    underscore: '/bower_components/underscore/underscore',
    'd3.parcoords': '/bower_components/d3.parcoords/index',
    lineupjs: '/bower_components/lineupjs/dist/LineUpJS'
  },
  map: {
    '*': {
      'css': '/bower_components/require-css/css.js', // or whatever the path to require-css is
      'font-awesome' : '/bower_components/require-css/css.js!/bower_components/font-awesome/css/font-awesome.min',
      'foundation-icons': '/bower_components/require-css/css.js!//cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons'
    }
  },
  shim: {
    'd3.parcoords': {
      deps: ['css!/bower_components/d3.parcoords-css/index', 'd3'],
      exports: 'd3.parcoords'
    },
    'jquery-ui': ['css!/bower_components/jquery-ui/themes/smoothness/jquery-ui', 'jquery'],
    lineupjs: ['css!/bower_components/lineupjs/css/style', 'font-awesome']
  },
  //main file
  deps: ['./main'],

  config : {
    //plugin config
    'caleydo/plugin' : {
      baseUrl : '/scripts',
      plugins: [
        {
          type: 'vis',
          name: 'heatmap',
          /**
           * icon of this vis type. Alternative: iconcss ... css class holding the icon
           * @default: none
           */
          icon: 'icon.svg',
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
          filter: 'matrix'
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
          icon: 'icon.svg',
          size: [360, 150],
          filter: 'table'
        },
        {
          type: 'vis',
          name: 'scatterplot',
          size: [300, 340],
          filter: 'matrix'
        },
        {
          type: 'vis',
          name: 'box',
          size: [300, 50],
          filter: function (data) {
            return data.desc.type === 'vector' && (data.desc.value.type === 'real' || data.desc.value.type === 'int');
          }
        },
        {
          type: 'vis',
          name: 'axis',
          icon: 'icon.svg',
          size: [50, 300],
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
          filter: 'table'
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
          module: 'caleydo/matrix'
        },
        {
          type: 'datatype',
          name: 'table',
          module: 'caleydo/table'
        },
        {
          type: 'datatype',
          name: 'vector',
          module: 'caleydo/vector'
        }
        //{ //template for adding a new data type
        //  type: 'datatype', //plugin type
        //  name: 'template', //unique id of a datatype
        //  module: './template-datatype' //module implementing this type
        //},
      ]
    }
  }
});