/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/** global define */
define({
  type: 'vis',
  name: 'parco',
  icon: 'parco/icon.svg',
  dependencies: {
    d3: "~3.4.11",
    "d3.parcoords": "http://syntagmatic.github.io/parallel-coordinates/d3.parcoords.js",
    "d3.parcoords-css": "http://syntagmatic.github.io/parallel-coordinates/d3.parcoords.css"
  },
  "requirejs-config": {
    paths: {
      'd3.parcoords': '${basedir}/d3.parcoords/index'
    },
    shim: {
      'd3.parcoords': {
        deps: ['css!${basedir}/d3.parcoords-css/index', 'd3'],
        exports: 'd3.parcoords'
      }
    }
  },
  size: function (dim) {
    return [360, 150];
  },
  filter: function (data) {
    return data.desc.type === 'table';
  }
});
