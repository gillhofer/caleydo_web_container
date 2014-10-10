/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/* global define */
define({
  type: 'vis',
  name: 'scatterplot',
  dependencies: {
    d3: "~3.4.11"
  },
  size: function () {
    return [300, 300 + 40];
  },
  filter: function (data) {
    return data.desc.type === 'matrix';
  }
});
