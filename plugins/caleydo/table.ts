/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import vector = require('./vector');

export interface ITable extends datatypes.IDataType {
  ncol : number;
  nrow : number;

  /**
   * id type
   */
  rowtype:idtypes.IDType;

  cols(range?:ranges.Range) : vector.IVector[];

  col(i:number) : vector.IVector;
  /**
   * returns a promise for getting the row names of the matrix
   * @param range
   */
  rows(range?:ranges.Range) : C.IPromise<string[]>;
  rowIds(range?:ranges.Range) : C.IPromise<ranges.Range>;

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : ITable;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param this_f the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector
  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number, j:number) : C.IPromise<any>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : C.IPromise<any[][]>;

  /**
   * returns a promise for getting the data as an array of objects
   * @param range
   */
  objects(range?:ranges.Range) : C.IPromise<any[]>;
}
