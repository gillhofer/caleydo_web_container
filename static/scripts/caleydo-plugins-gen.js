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
          module: './heatmap/index',
          size: function (dim) {
            return [dim[0] * 20, dim[1] * 20];
          },
          filter: function (data) {
            return data.type === 'matrix';
          }
        },
        {
          type: 'vis',
          name: 'table',
          module: './table/index',
        }
//auto generate end
      ]
    }
  }
)
