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
            return [dim[0] * 40, dim[1] * 40];
          },
          filter: function (data) {
            return data.type === 'matrix';
          }
        },
        {
          type: 'vis',
          name: 'table',
          module: './table/index',
        },
        {
          type: 'vis',
          name: 'parco',
          module: './parco/index',
        },
        {
          type: 'vis',
          name: 'scatterplot',
          module: './scatterplot/index',
        }
//auto generate end
      ]
    }
  }
)
