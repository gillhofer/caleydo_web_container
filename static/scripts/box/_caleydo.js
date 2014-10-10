/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/* global define */
define({
  type: 'vis',
  name: 'box',
  version: '0.0.1',
  dependencies: {
    d3: '~3.4.11'
  },
  size: function () {
    return [300, 50];
  },
  filter: function (data) {
    return data.desc.type === 'vector' && (data.desc.value.type === 'real' || data.desc.value.type === 'int');
  }
});
