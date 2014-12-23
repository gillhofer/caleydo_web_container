/**
 * Created by Samuel Gratzl on 29.08.2014.
 */
/* global define */
'use strict';

import C = require('../caleydo/main');
import datatypes = require('../caleydo/datatype');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');

export class Template extends idtypes.SelectAble implements datatypes.IDataType {
  constructor(public desc: datatypes.IDataDescription) {
    super();
  }

  get dim() {
    return [];
  }

  get idtypes() {
    return [];
  }

  ids(range?:ranges.Range) : C.IPromise<ranges.Range> {
    return C.resolved(ranges.none());
  }

  idView(idRange?: ranges.Range) : C.IPromise<Template> {
    return C.resolved(this);
  }

  persist() {
    return this.desc.id;
  }

  restore(persisted: any) {
    return this;
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
