/**
 * Created by Samuel Gratzl on 27.08.2014.
 */
//global define

define('fontawesome', ['css!//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css'], function (c) {
  return c;
});

define('foundation-icons', ['css!//cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.css'], function (c) {
  return c;
});

define('lineupjs', ['/bower_components/lineupjs/src/lineup_storage.js',
  '/bower_components/lineupjs/src/lineup_datastructure.js',
  '/bower_components/lineupjs/src/lineup.js',
  '/bower_components/lineupjs/src/lineup_tableheader.js',
  '/bower_components/lineupjs/src/lineup_tablebody.js',
  '/bower_components/lineupjs/src/lineup_layout.js',
  '/bower_components/lineupjs/src/lineup_gui_helper.js',
  '/bower_components/lineupjs/src/lineup_mappingeditor.js',
  'css!/bower_components/lineupjs/css/style.css', 'jquery', 'd3', 'underscore'], function () {
  var r = LineUp;
  r.LineUpLocalStorage = LineUpLocalStorage;
  return r;
});