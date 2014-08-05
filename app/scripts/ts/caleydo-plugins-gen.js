/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
define(function () {
    return {
      plugins: [
//auto generate
        {
          type: 'vis',
          name: 'heatmap',
          description: 'simple heatmap',
          version: '0.0.1-alpha',
          size: function (dim) {
            return [dim[0] * 20, dim[1] * 20];
          }
        }
//auto generate end
      ]
    }
  }
)
