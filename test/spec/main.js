/**
 * Created by Samuel Gratzl on 21.07.2014.
 */

/*global require */
require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery'
  }
});

require([
 'test-caleydo',
  'test-caleydo-events'
], function () {
  'use strict';
  mocha.run();
})
