/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./caleydo');
import events = require('./caleydo-events');
import idtypes = require('./caleydo-idtypes');
import ranges = require('./caleydo-range');

/**
 * basic description elements
 */
export interface IDataDescription {
  name: string;
  id: string;
  type: string;
}
/**
 * basic data type interface
 */
export interface IDataType extends idtypes.SelectAble {
  desc: IDataDescription;
  /**
   * dimensions of this datatype
   * rows, cols, ....
   */
  dim: number[];
}

/**
 * dummy data type just holding the description
 */
export class DummyDataType extends idtypes.SelectAble implements IDataType {
  constructor(public desc: IDataDescription) {
    super();
  }

  get dim() {
    return [];
  }

  ids(range:ranges.Range = ranges.all()) : C.IPromise<ranges.Range> {
    return C.resolved(ranges.none());
  }

  get idtypes() {
    return [];
  }
}

/**
 * transpose the given matrix
 * @param m
 * @returns {*}
 */
export function transpose(m: any[][]) {
  if (m.length === 0 || m[0].length === 0) {
    return [];
  }
  var r = m[0].map((i) => [i]);
  for(var i = 1; i < m.length; ++i) {
     m[i].forEach((v,i) => r[i].push(v));
  }
  return r;
}