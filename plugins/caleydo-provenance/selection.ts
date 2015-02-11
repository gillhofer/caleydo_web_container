/**
 * Created by sam on 10.02.2015.
 */

import idtypes = require('../caleydo/idtype');
import events = require('../caleydo/event');
import provenance = require('./main');
import ranges = require('../caleydo/range');

function select(inputs:provenance.IObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var idtype = parameter.idtype,
    range = ranges.parse(parameter.range),
    type = parameter.type;
  var bak = parameter.old ? ranges.parse(parameter.old) : idtype.selections(type);
  idtype.select(type, range);
  return {
    created: [],
    removed: [],
    inverse: createSelection(idtype, type, bak)
  };
}

function meta(idtype:idtypes.IDType, type:string, range:ranges.Range) {
  return provenance.meta(range.toString() + ' ' + idtype.names + ' ' + type, provenance.cat.selection);
}

/**
 * create a selection command
 * @param idtype
 * @param type
 * @param range
 * @param old optional the old selection for inversion
 * @returns {Cmd}
 */
export function createSelection(idtype:idtypes.IDType, type:string, range:ranges.Range, old:ranges.Range = null) {
  return new provenance.Cmd(meta(idtype, type, range), 'select', select, [], {
    idtype: idtype,
    range: range,
    type: type,
    old: old
  });
}

/**
 * utility class to record all the selections within the provenance graph for a specific idtype
 */
class SelectionTypeRecorder {
  private l = (event, type, sel, added, removed, old) => {
    var cmd = createSelection(this.idtype, type, sel, old);
    this.graph.push(cmd);
  };
  private t = (event, sel, added, removed, old) => {
    return this.l(event, this.type, sel, added, removed, old);
  };

  constructor(private idtype:idtypes.IDType, private graph:provenance.ProvenanceGraph, private type?:string) {
    if (type) {
      idtype.on('select-' + type, this.t);
    } else {
      idtype.on('select', this.l);
    }
  }

  destroy() {
    if (this.type) {
      this.idtype.off('select-' + this.type, this.t);
    } else {
      this.idtype.off('select', this.l);
    }
  }
}
/**
 * utility class to record all the selections within the provenance graph
 */
export class SelectionRecorder {
  private handler:SelectionTypeRecorder[] = [];
  private adder = (event, idtype) => {
    this.handler.push(new SelectionTypeRecorder(idtype, this.graph, this.type));
  };

  constructor(private graph:provenance.ProvenanceGraph, private type?:string) {
    events.on('register.idtype', this.adder);
    idtypes.list().forEach((d) => {
      this.adder(null, d);
    });
  }

  destroy() {
    events.off('register.idtype', this.adder);
    this.handler.forEach((h) => h.destroy());
    this.handler.length = 0;
  }
}


export function create(graph:provenance.ProvenanceGraph, type?:string) {
  return new SelectionRecorder(graph, type);
}

export function createCmd(id:string) {
  switch (id) {
    case 'select':
      return select;
  }
  return null;
}
