/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./caleydo');
import events = require('./caleydo-events');
import ranges = require('./caleydo-range');
'use strict';

var cache = {}, filledUp = false;

export var defaultSelectionType = 'selected';
export var hoverSelectionType = 'hovered';

export enum SelectOperation {
  SET, ADD, REMOVE
}

export class IDType extends events.EventHandler {
  private sel = {};

  constructor(public name:string, public names:string) {
    super();
  }

  selections(type = defaultSelectionType) {
    if (this.sel.hasOwnProperty(type)) {
      return this.sel[type];
    }
    return this.sel[type] = ranges.none();
  }

  select(range:ranges.Range);
  select(range:ranges.Range, op:SelectOperation);
  select(range:number[]);
  select(range:number[], op:SelectOperation);
  select(type:string, range:ranges.Range);
  select(type:string, range:ranges.Range, op:SelectOperation);
  select(type:string, range:number[]);
  select(type:string, range:number[], op:SelectOperation);
  select(r_or_t:any, r_or_op ?:any, op = SelectOperation.SET) {
    function asRange(v:any) {
      if (C.isArray(v)) {
        return ranges.list(v);
      }
      return v;
    }

    var type = (typeof r_or_t === 'string') ? r_or_t.toString() : defaultSelectionType;
    var range = asRange((typeof r_or_t === 'string') ? r_or_op : r_or_t);
    op = (typeof r_or_t === 'string') ? op : (r_or_op ? r_or_op : SelectOperation.SET);
    return this.selectImpl(range, op, type);
  }

  private selectImpl(range:ranges.Range, op = SelectOperation.SET, type:string = defaultSelectionType) {
    var b = this.selections(type);
    var new_:ranges.Range = ranges.none();
    switch (op) {
      case SelectOperation.SET:
        new_ = range;
        break;
      case SelectOperation.ADD:
        new_ = b.union(range);
        break;
      case SelectOperation.REMOVE:
        new_ = b.without(range);
        break;
    }
    if (b.eq(new_)) {
      return b;
    }
    this.sel[type] = new_;
    this.fire('select', [new_, op !== SelectOperation.REMOVE ? range : ranges.none(), (op === SelectOperation.ADD ? ranges.none() : (op === SelectOperation.SET ? b : range))]);
    return b;
  }

  clear(type = defaultSelectionType) {
    return this.selectImpl(ranges.none(), SelectOperation.SET, type);
  }
}


export class SelectAble extends events.EventHandler {
  private _numSelectListeners = 0;
  private _selectionListener = (event: any, act: ranges.Range, added: ranges.Range, removed: ranges.Range) => {
    this.ids().then((ids: ranges.Range) => {
      //filter to the right ids and convert to indices format
      act = ids.indexRangeOf(act);
      added = ids.indexRangeOf(added);
      removed = ids.indexRangeOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      this.fire('select',[act, added, removed]);
    })
  };

  ids(range?:ranges.Range) : C.IPromise<ranges.Range> {
    throw new Error('not implemented');
  }

  get idtypes() : IDType[] {
    throw new Error('not implemented');
  }

  on(events, handler) {
    if (events === 'select') {
      this._numSelectListeners ++;
      if (this._numSelectListeners === 1) {
        this.idtypes.forEach((i) => i.on('select', this._selectionListener));
      }
    }
    return super.on(events, handler);
  }

  off(events, handler) {
    if (events === 'select') {
      this._numSelectListeners --;
      if (this._numSelectListeners === 0) {
        this.idtypes.forEach((i) => i.off('select', this._selectionListener));
      }
    }
    return super.off(events, handler);
  }

  selections(type = defaultSelectionType) {
    return this.ids().then((ids: ranges.Range) => {
      var r = ranges.join(this.idtypes.map((idtype) => idtype.selections(type)));
      return ids.indexRangeOf(r);
    });
  }

  select(range: ranges.Range);
  select(range: ranges.Range, op : SelectOperation);
  select(range: number[]);
  select(range: number[], op : SelectOperation);
  select(type: string, range: ranges.Range);
  select(type: string, range: ranges.Range, op : SelectOperation);
  select(type: string, range: number[]);
  select(type: string, range: number[], op : SelectOperation);
  select(r_or_t : any, r_or_op ?: any, op = SelectOperation.SET) {
    function asRange(v:any) {
      if (C.isArray(v)) {
        return ranges.list(v);
      }
      return v;
    }

    var type = (typeof r_or_t === 'string') ? r_or_t.toString() : defaultSelectionType;
    var range = asRange((typeof r_or_t === 'string') ? r_or_op : r_or_t);
    op = (typeof r_or_t === 'string') ? op : (r_or_op ? r_or_op : SelectOperation.SET);
    return this.selectImpl(range, op, type);
  }

  private selectImpl(range: ranges.Range, op = SelectOperation.SET, type : string = defaultSelectionType) {
    return this.ids().then((ids: ranges.Range) => {
      range = ids.preMultiply(range);
      var types = this.idtypes;
      var r = ranges.join(range.split().map((r, i) => types[i].select(type, r, op)));
      while(r.ndim < types.length) {
        r.dim(r.ndim); //create intermediate ones
      }
      return ids.indexRangeOf(r);
    });
  }

  clear(type = defaultSelectionType) {
    return this.selectImpl(ranges.none(), SelectOperation.SET, type);
  }
}

function fillUpData(entries) {
  entries.forEach(function (row) {
    var entry = cache[row.id];
    if (entry) {
      entry.name = row.name;
      entry.names = row.names;
    } else {
      entry = new IDType(row.name, row.names);
    }
    cache[row.id] = entry;
  });
}

function fillUp() {
  if (filledUp) {
    return;
  }
  filledUp = true;
  C.getJSON('api/idtype/').then(function (c) {
    fillUpData(c);
    return cache;
  });
}

export function resolve(id:string):IDType {
  return register(id, new IDType(id, id + 's'));
}

export function list() {
  fillUp(); //trigger loading of the meta data
  return this.cache;
}

export function register(id:string, idtype:IDType) {
  fillUp(); //trigger loading of the meta data
  if (cache.hasOwnProperty(id)) {
    return cache[id];
  }
  cache[id] = idtype;
  return idtype;
}
