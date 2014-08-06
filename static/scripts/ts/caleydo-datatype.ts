/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import events = require('./caleydo-events');

export interface IDataDescription {
  name: string;
  id: string;
  type: string;
}
/**
 * basic data type interface
 */
export interface IDataType extends events.EventHandler {
  desc: IDataDescription;
  /**
   * dimensions of this datatype
   */
  dim: number[];
}

export class DummyDataType extends events.EventHandler implements IDataType {
  constructor(public desc: IDataDescription) {
    super();
  }

  get dim() {
    return [];
  }
}

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