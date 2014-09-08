/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./caleydo');
import events = require('./caleydo-events');
import ranges = require('./caleydo-range');
'use strict';

var cache = {}, filledUp = false;

var defaultSelectionType = 'selected';

export class IDType extends events.EventHandler {
  private sel = {};
  constructor(public name: string, public names: string) {
    super();
  }

  selections(type = defaultSelectionType) {
    if (this.sel.hasOwnProperty(type)) {
      return this.sel[type];
    }
    return this.sel[type] = ranges.none();
  }

  set(type : string, range : ranges.Range): ranges.Range;
  set(range: ranges.Range): ranges.Range;
  set(first : any, r?: ranges.Range) {
    var type = (typeof first === 'string') ? first : defaultSelectionType;
    var range = (typeof first === 'string') ? r : first;
    return this.setImpl(range, type);
  }

  private setImpl(range: ranges.Range, type: string) {
    var b = this.selections(type);
    this.sel[type] = range;
    this.fire('select', [range, range, b]);
    return b;
  }

  clear(type = defaultSelectionType) {
    return this.setImpl(ranges.none(), type);
  }

  add(type :string, range : ranges.Range): ranges.Range;
  add(range: ranges.Range): ranges.Range;
  add(first : any, r?: ranges.Range) {
    var type = (typeof first === 'string') ? first : defaultSelectionType;
    var range = (typeof first === 'string') ? r : first;
    return this.addImpl(range, type);
  }

  private addImpl(range: ranges.Range, type: string) {
    var b = this.selections(type);
    if (this.sel.hasOwnProperty(type)) {
      this.sel[type] = b.union(range);
    } else {
      this.sel[type] = range;
    }
    this.fire('select', [this.sel[type], range, ranges.none()]);
    return b;
  }

  remove(type :string, range : ranges.Range): ranges.Range;
  remove(range: ranges.Range): ranges.Range;
  remove(first : any, r?: ranges.Range) {
    var type = (typeof first === 'string') ? first : defaultSelectionType;
    var range = (typeof first === 'string') ? r : first;
    return this.removeImpl(range, type);
  }

  private removeImpl(range: ranges.Range, type: string) {
    var b = this.selections(type);
    if (this.sel.hasOwnProperty(type)) {
      this.sel[type] = b.without(range);
    }
    this.fire('select', [this.sel[type] || ranges.none(), ranges.none(), range]);
    return b;
  }
}

function fillUp(entries) {
  entries.forEach(function (row) {
    var entry = cache[row.id];
    if (entry) {
      entry.name = row.name;
      entry.names = row.names;
    } else {
      entry = new IDType(entry.name, entry.names);
    }
    cache[entry.id] = entry;
  });
}

function load() {
  if(filledUp) {
    return C.resolved(cache);
  }
  return C.getJSON('api/idtype/').then(function(c) {
    fillUp(c);
    filledUp = true;
    return cache;
  });
}

export function resolve(id: string) : IDType {
  return register(id, new IDType(id, id+'s'));
}

export function list() {
  return load();
}

export function register(id : string, idtype : IDType) {
  if(!filledUp) {
    load(); //trigger loading of the meta data
  }
  if (cache.hasOwnProperty(id)) {
    return cache[id];
  }
  cache[id] = idtype;
  return idtype;
}
