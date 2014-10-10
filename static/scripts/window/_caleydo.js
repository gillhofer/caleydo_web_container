/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/* global define */
define({
  type: 'ui',
  name: 'window',
  dependencies: {
    'jquery': '~1.10.2',
    'jquery-ui': '~1.10.2',
    'font-awesome': '>=4.2.0'
  },
  'requirejs-config': {
    shim: {
      'jquery-ui': ['css!${basedir}/jquery-ui/themes/smoothness/jquery-ui.css', 'jquery']
    }
  }
});
