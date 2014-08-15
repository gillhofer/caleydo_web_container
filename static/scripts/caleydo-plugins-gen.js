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
          /**
           * optional function returning the expected size of the vis given the dimension (nrow,ncol) of the represented data
           * default unknown
           * @param dim array containing the data dimensions returned by IDataType.dim
           * @returns {*[]}
           */
          size: function (dim) {
            return [dim[0] * 20, dim[1] * 20];
          },
          /**
           * optional filter for which this vis can be applied, given an IDataType
           * default: all
           * @param data
           * @returns {boolean}
           */
          filter: function (data) {
            return data.desc.type === 'matrix';
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
          name: 'scatterplot'
        },
        {
          type: 'vis',
          name: 'links'
        },        {
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
