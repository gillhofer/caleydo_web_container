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
          factory: 'create',
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
          factory: 'create'
        },
        {
          type: 'vis',
          name: 'parco',
          module: './parco/index',
          factory: 'create'
        },
        {
          type: 'datatype',
          name: 'matrix',
          module: './caleydo-matrix',
          factory: 'create'
        },
        {
          type: 'datatype',
          name: 'table',
          module: './caleydo-table',
        },
        {
          type: 'datatype',
          name: 'vector',
          module: './caleydo-vector',
          factory: 'create'
        }
//auto generate end
      ]
    }
  }
)
