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

define('lineupjs', ['../bower_components/lineupjs/dist/LineUpJS', 'css!/bower_components/lineupjs/css/style.css'], function (LineUpJS) {
  return LineUpJS;
});