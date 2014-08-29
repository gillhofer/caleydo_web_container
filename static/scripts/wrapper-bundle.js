/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

//define jquery ui a special wrapper to auto include the css file
define('jquery-ui', ['jquery-ui-js', 'css!/bower_components/jquery-ui/themes/smoothness/jquery-ui.css'], function(jqueryui) {
  return jqueryui;
});