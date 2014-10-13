/*global require */
require.config({
  "baseUrl": "/scripts",
  "paths": {
    "d3": "/bower_components/d3/d3",
    "d3.parcoords": "/bower_components/d3.parcoords/index",
    "jquery": "/bower_components/jquery/jquery",
    "jquery-ui": "/bower_components/jquery-ui/ui/jquery-ui",
    "lineupjs": "/bower_components/lineupjs/dist/LineUpJS",
    "underscore": "/bower_components/underscore/underscore"
  },
  "map": {
    "*": {
      "css": "/bower_components/require-css/css.js",
      "font-awesome": "/bower_components/require-css/css.js!/bower_components/font-awesome/./css/font-awesome"
    }
  },
  "deps": [
    "./main"
  ],
  "config": {
    "caleydo/main": {
      "apiUrl": "/api"
    },
    "caleydo/plugin": {
      "baseUrl": "/scripts",
      "plugins": [
        {
          "type": "datatype",
          "id": "matrix",
          "module": "caleydo/matrix"
        },
        {
          "type": "datatype",
          "id": "table",
          "module": "caleydo/table"
        },
        {
          "type": "datatype",
          "id": "vector",
          "module": "caleydo/vector"
        },
        {
          "type": "autoload",
          "id": "caleydo-links"
        },
        {
          "type": "vis",
          "id": "caleydo-template",
          "name": "Template",
          "size": [
            100,
            100
          ],
          "filter": "template"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-axis",
          "name": "Axis",
          "icon": "icon.svg",
          "size": [
            50,
            300
          ],
          "filter": function (data) { return data.desc.type === 'vector' && (data.desc.value.type === 'real' || data.desc.value.type === 'int'); }
        },
        {
          "type": "vis",
          "id": "caleydo-vis-box",
          "name": "BoxPlot",
          "icon": "icon.png",
          "size": [
            300,
            50
          ],
          "filter": function (data) { return data.desc.type === 'vector' && (data.desc.value.type === 'real' || data.desc.value.type === 'int'); }
        },
        {
          "type": "vis",
          "id": "caleydo-vis-heatmap",
          "name": "HeatMap",
          "icon": "icon.svg",
          "size": function (dim) { return [dim[1] * 10, dim[0] * 10]; },
          "filter": "matrix"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-histogram",
          "name": "Histogram",
          "icon": "icon.png",
          "size": [
            200,
            100
          ],
          "filter": "vector"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-lineup",
          "name": "LineUp",
          "size": function (dim) { return [Math.min(dim[1] * 100, 1000), Math.min(dim[0] * 20, 600)]; },
          "filter": "table"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-parco",
          "name": "Parallel Coordinates Plot",
          "icon": "icon.svg",
          "size": [
            360,
            150
          ],
          "filter": "table"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-pie",
          "name": "Pie",
          "icon": "icon.png",
          "size": [
            100,
            100
          ],
          "filter": function (data) { return data.desc.type === 'vector' && (data.desc.value.type === 'categorical'); }
        },
        {
          "type": "vis",
          "id": "caleydo-vis-scatterplot",
          "name": "ScatterPlot",
          "size": [
            300,
            340
          ],
          "filter": "matrix"
        },
        {
          "type": "vis",
          "id": "caleydo-vis-table",
          "name": "Table",
          "size": function (dim) { return [dim[1] * 110, dim[0] * 22]; }
        }
      ]
    }
  },
  "shim": {
    "lineupjs": [
      "css!/bower_components/lineupjs/css/style"
    ],
    "d3.parcoords": {
      "deps": [
        "css!/bower_components/d3.parcoords-css/index",
        "d3"
      ],
      "exports": "d3.parcoords"
    },
    "jquery-ui": [
      "css!/bower_components/jquery-ui/themes/smoothness/jquery-ui.css",
      "jquery"
    ]
  }
});