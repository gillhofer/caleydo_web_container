/**
 * Created by Samuel Gratzl on 09.10.2014.
 */
/** global define */
define({
  type: 'vis',
  name: 'template',
  dependencies: {
    d3: "~3.4.11"
  },
  size: function () {
    return [100, 100];
  },
  filter: function (data) {
    return data.desc.type === 'template';
  }
});
