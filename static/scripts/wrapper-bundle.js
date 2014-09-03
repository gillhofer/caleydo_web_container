/**
 * Created by Samuel Gratzl on 27.08.2014.
 */
//global define

//define jquery ui a special wrapper to auto include the css file
define('jquery-ui', ['jquery-ui-js', 'css!/bower_components/jquery-ui/themes/smoothness/jquery-ui.css'], function (jqueryui) {
  return jqueryui;
});

define('fontawesome', ['css!//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css'], function (c) {
  return c;
});