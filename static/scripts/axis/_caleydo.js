/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/** global exports */
define({
  type: 'vis',
  name: 'axis',
  version: "0.0.1",
  dependencies: {
    d3: "~3.4.11"
  },
  icon: 'axis/icon.svg',
  size: function () {
    return [50, 300];
  },
  filter: function (data) {
    return data.desc.type === 'vector' && data.desc.value.type === 'real';
  }
});
