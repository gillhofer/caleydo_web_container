/*global require */
require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '/bower_components/jquery/jquery',
    'jquery-ui': '/bower_components/jquery-ui/ui/jquery-ui',
    d3: '/bower_components/d3/d3',
    underscore: '/bower_components/underscore/underscore',
    'caleydo-plugins-gen': './caleydo-plugins-gen',
    'd3.parcoords': '/bower_components/d3.parcoords/index',
    lineupjs: '/bower_components/lineupjs/dist/LineUpJS'
  },
  map: {
    '*': {
      'css': '/bower_components/require-css/css.js' // or whatever the path to require-css is
    }
  },
  shim: {
    'd3.parcoords': {
      deps: ['css!/bower_components/d3.parcoords-css/index', 'd3'],
      exports: 'd3.parcoords'
    },
    'jquery-ui': ['css!/bower_components/jquery-ui/themes/smoothness/jquery-ui.css', 'jquery'],
    lineupjs: ['css!/bower_components/lineupjs/css/style.css', 'font-awesome']
  },
  bundles: {
    'wrapper-bundle': ['font-awesome', 'foundation-icons']
  }
});

require(['./playground'], function () {
  //nothing to do
});
