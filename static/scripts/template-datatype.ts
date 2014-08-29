/**
 * Created by Samuel Gratzl on 29.08.2014.
 */

'use strict';

import datatypes = require('./caleydo-datatype');
import events = require('./caleydo-events');

export class Template extends events.EventHandler implements datatypes.IDataType {
  constructor(public desc: datatypes.IDataDescription) {
    super();
  }

  get dim() {
    return [];
  }

}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: datatypes.IDataDescription): Template {
  return new Template(desc);
}