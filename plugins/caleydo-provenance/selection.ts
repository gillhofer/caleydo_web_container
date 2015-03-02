/**
 * Created by sam on 10.02.2015.
 */

import idtypes = require('../caleydo/idtype');
import events = require('../caleydo/event');
import provenance = require('./main');
import C = require('../caleydo/main');
import ranges = require('../caleydo/range');

function select(inputs:provenance.IObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var idtype = parameter.idtype,
    range = ranges.parse(parameter.range),
    type = parameter.type;
  var bak = parameter.old ? ranges.parse(parameter.old) : idtype.selections(type);
  parameter.rec.disable(); //disable listening to events
  if (C.hash.is('debug')) {
    console.log('select', range.toString());
  }
  idtype.select(type, range);
  parameter.rec.enable();
  return {
    inverse: createSelection(idtype, parameter.rec, type, bak, range)
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
export function createSelection(idtype:idtypes.IDType, rec: SelectionTypeRecorder, type:string, range:ranges.Range, old:ranges.Range = null) {
  return {
    meta: meta(idtype, type, range),
    id: 'select',
    f: select,
    parameter: {
      idtype: idtype,
      range: range,
      type: type,
      old: old,
      rec: rec
    }
  };
}

export function createCompressor() : provenance.IActionCompressor {
  return {
    matches : (id) => id === 'select',
    toKey : (cmd) => { //by idtype and type
      var para = cmd.parameter;
      return 'select:'+para.idtype + '@' + para.type;
    },
    select : (cmds) => cmds[cmds.length-1] //last survive
  };
}

/**
 * utility class to record all the selections within the provenance graph for a specific idtype
 */
class SelectionTypeRecorder {
  private l = (event, type, sel, added, removed, old) => {
    var cmd = createSelection(this.idtype, this, type, sel, old);
    this.graph.push(cmd);
  };
  private t = (event, sel, added, removed, old) => {
    return this.l(event, this.type, sel, added, removed, old);
  };

  constructor(private idtype:idtypes.IDType, private graph:provenance.ProvenanceGraph, private type?:string, private options : any = {}) {
    this.enable();
  }

  disable() {
    if (this.type) {
      this.idtype.off('select-' + this.type, this.t);
    } else {
      this.idtype.off('select', this.l);
    }
  }

  enable() {
    if (this.type) {
      this.idtype.on('select-' + this.type, this.t);
    } else {
      this.idtype.on('select', this.l);
    }
  }

  destroy() {
    this.disable();
  }
}
/**
 * utility class to record all the selections within the provenance graph
 */
export class SelectionRecorder {
  private handler:SelectionTypeRecorder[] = [];
  private adder = (event, idtype) => {
    if (this.options.filter(idtype)) {
      this.handler.push(new SelectionTypeRecorder(idtype, this.graph, this.type, this.options));
    }
  };

  constructor(private graph:provenance.ProvenanceGraph, private type?:string, private options : any = {}) {
    this.options = C.mixin({
      filter: C.constantTrue
    }, this.options);
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


export function create(graph:provenance.ProvenanceGraph, type?:string, options: any = {}) {
  return new SelectionRecorder(graph, type, options);
}

export function createCmd(id:string) {
  switch (id) {
    case 'select':
      return select;
  }
  return null;
}
