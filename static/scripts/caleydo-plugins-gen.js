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
          size: function (dim) {
            return [dim[0] * 20, dim[1] * 20];
          },
          filter: function (data) {
            return data.type === 'matrix';
          }
        },
        {
          type: 'vis',
          name: 'table'
        },
        {
          type: 'vis',
          name: 'parco'
        },
        {
          type: 'vis',
          name: 'scatterplot',
          module: './scatterplot/index',
          factory: 'create'
        },
        {
          type: 'datatype',
          name: 'matrix',
          module: './caleydo-matrix'
        },
        {
          type: 'datatype',
          name: 'table',
          module: './caleydo-table'
        },
        {
          type: 'datatype',
          name: 'vector',
          module: './caleydo-vector'
        }
//auto generate end
      ]
    }
  }
)
