/*global require */
require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery'
  }
});

require([
    'app',
    'jquery',
    'caleydo'
  ], function (app, $, C) {
    'use strict';
    // use app here
    console.log(app);
    console.log(C.version);
    console.log('Running jQuery %s', $().jquery);
  }
);
