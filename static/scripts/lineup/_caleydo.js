/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/** global define */
define({
  type: 'vis',
  name: 'lineup',
  version: "0.0.1",
  dependencies: {
    d3: "~3.4.11",
    lineupjs : "git@github.com:Caleydo/lineup.js.git#singlesvg"
  },
  "requirejs-config": {
    paths: {
      'lineupjs': '${basedir}/lineupjs/dist/LineUpJS'
    },
    shim: {
      'lineupjs': ['css!${basedir}/lineupjs/css/style']
    }
  },
  size: function (dim) {
    return [Math.min(dim[1] * 100, 1000), Math.min(dim[0] * 20, 600)];
  },
  filter: function (data) {
    return data.desc.type === 'table';
  }
});
