/**
 * Created by Samuel Gratzl on 21.07.2014.
 */

/*global require, mocha */
require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery'
  }
});

require([
  './caleydo/test-main',
  './caleydo/test-event',
  './caleydo/test-iterator',
  './caleydo/test-range'
], function () {
  'use strict';
  mocha.run();
});
