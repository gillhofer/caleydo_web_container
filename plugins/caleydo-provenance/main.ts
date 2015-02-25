/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('../caleydo/main');
import plugins = require('../caleydo/plugin');
import graph = require('../caleydo/graph');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');
import datatypes = require('../caleydo/datatype');
import session = require('../caleydo/session');


export var cat = {
  data: 'data',
  selection: 'selection',
  visual: 'visual',
  layout: 'layout',
  logic: 'logic',
  custom: 'custom',
  annotation: 'annotation'
};

export var op = {
  create : 'create',
  update : 'update',
  remove : 'remove'
};


export interface IObjectRef<T> {
  name: string;
  category : string;
  v : T;
}

export function ref<T>(v: T, name: string, category = cat.data): IObjectRef<T> {
  return {
    v: v,
    name: name,
    category: category
  };
}

export interface ICmdResult {
  inverse : any;
  created? : IObjectRef<any>[];
  removed? : IObjectRef<any>[];
}

export interface ICmdFunction {
  (inputs: IObjectRef<any>[], parameters: any) : ICmdResult;
}

export interface ICmdFunctionPromise {
  (inputs: IObjectRef<any>[], parameters: any) : C.IPromise<ICmdResult>;
}


export interface ICmdFunctionFactory {
  (id: string): ICmdFunction;
}

function createCompositeCmd(factories : ICmdFunctionFactory[]) {
  return (id :string) => {
    var r, i, fl = factories.length;
    for(i = 0; i < fl; ++i) {
      r = factories[i](id);
      if (r) {
        return r;
      }
    }
    return null; //can't create
  };
}


export class ObjectNode<T> extends graph.GraphNode implements IObjectRef<T> {
  constructor(public v : T, public name: string, public category = cat.data) {
    super('object');
  }

  persist(id: number) {
    var r = super.persist(id);
    r.name = this.name;
    r.category = this.category;
    return r;
  }

  static restore(p) {
    return new ObjectNode<any>(null, p.name, p.category);
  }

  get createdBy() {
    var r = this.incoming.filter(graph.isType('creates'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get removedBy() {
    var r = this.incoming.filter(graph.isType('removes'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get requiredBy() {
    return this.incoming.filter(graph.isType('requires')).map((e) => <ActionNode>e.source);
  }

  get partOf() {
    return this.incoming.filter(graph.isType('consistsOf')).map((e) => <StateNode>e.source);
  }

  toString() {
    return this.name;
  }
}

export class ActionMetaData {
  constructor(public category: string, public operation: string, public name: string, public timestamp: number = Date.now(), public user: string = session.retrieve('user', 'Anonymous')) {

  }
  static restore(p) {
    return new ActionMetaData(p.category, p.operation, p.name, p.timestamp, p.user);
  }
}

export function meta(name: string, category: string = cat.data, operation: string = op.update, timestamp: number = Date.now(), user: string = session.retrieve('user', 'Anonymous')) {
  return new ActionMetaData(category, operation, name, timestamp, user);
}

export interface IAction {
  meta: ActionMetaData;
  id : string;
  f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult;
  inputs?: IObjectRef<any>[];
  parameter?: any;
}

export function action(meta: ActionMetaData, id : string, f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, inputs: IObjectRef<any>[] = [] ,parameter: any = {}): IAction {
  return {
    meta: meta,
    id: id,
    f: f,
    inputs: inputs,
    parameter: parameter
  };
}

export class ActionNode extends graph.GraphNode {
  private inverter : () => IAction;
  onceExecuted = false;

  constructor(public meta: ActionMetaData, public f_id : string, private f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, public parameter: any = {}) {
    super('action');
  }

  persist(id: number) {
    var r = super.persist(id);
    r.meta = this.meta;
    r.f_id = this.f_id;
    r.parameter = this.parameter;
    r.onceExecuted = this.onceExecuted;
    return r;
  }

  static restore(r, factory: ICmdFunctionFactory) {
    var a = new ActionNode(ActionMetaData.restore(r.meta), r.f_id, factory(r.f_id), r.parameter);
    a.onceExecuted = r.onceExecuted;
    return a;
  }

  toString() {
    return this.meta.name;
  }

  get inverse() {
    var r = this.incoming.filter(graph.isType('inverse'))[0];
    return r ? <ActionNode>r.source : null;
  }

  getOrCreateInverse(graph: ProvenanceGraph) {
    var i = this.inverse;
    if (i) {
      return i;
    }
    if (this.inverter) {
      return graph.createInverse(this, this.inverter);
    }
    this.inverter = null; //not needed anymore
    return null;
  }

  updateInverse(graph: ProvenanceGraph, inverter : () => IAction) {
    var i = this.inverse;
    if (i) { //update with the actual values / parameter only
      var c = inverter.call(this);
      i.parameter = c.parameter;
      this.inverter = null;
    } else {
      this.inverter = inverter;
    }
  }

  execute(graph: ProvenanceGraph):C.IPromise<ICmdResult> {
    var r = this.f.call(this, this.requires, this.parameter, graph);
    return C.asPromise(r);
  }

  equals(that:ActionNode):boolean {
    if (!(this.meta.category === that.meta.category && that.meta.operation === that.meta.operation)) {
      return false;
    }
    if (this.f_id !== that.f_id) {
      return false;
    }
    //TODO check parameters if they are the same
    return true;
  }

  get creates() {
    return this.outgoing.filter(graph.isType('creates')).map((e) => <ObjectNode<any>>e.target);
  }

  get removes() {
    return this.outgoing.filter(graph.isType('removes')).map((e) => <ObjectNode<any>>e.target);
  }

  get requires() {
    return this.outgoing.filter(graph.isType('requires')).map((e) => <ObjectNode<any>>e.target);
  }

  get resultsIn() {
    var r = this.outgoing.filter(graph.isType('resultsIn'))[0];
    return r ? <StateNode>r.target : null;
  }

  get previous() {
    var r = this.incoming.filter(graph.isType('next'))[0];
    return r ? <StateNode>r.source : null;
  }
}

export class StateNode extends graph.GraphNode {
  constructor(public name: string) {
    super('state');
  }

  persist(id: number) {
    var r = super.persist(id);
    r.name = this.name;
    return r;
  }

  static restore(r) {
    return new StateNode(r.name);
  }

  get consistsOf() {
    return this.outgoing.filter(graph.isType('consistsOf')).map((e) => <ObjectNode<any>>e.target);
  }

  get resultsFrom() {
    return this.incoming.filter(graph.isType('resultsIn')).map((e) => <ActionNode>e.source);
  }

  get next() {
    return this.outgoing.filter(graph.isType('next')).map((e) => <ActionNode>e.target);
  }

  get previousState() {
    if (this.name === 'start') { //root has no previous
      return null;
    }
    var r = this.resultsFrom[0];
    if (r) {
      return r.previous;
    }
    return null;
  }

  get path() {
    var p = this.previousState,
      r : StateNode[] = [];
    r.unshift(this);
    if (p) {
      p.previousStates(r);
    }
    return r;
  }
  previousStates(r : StateNode[]) {
    var p = this.previousState;
    r.unshift(this);
    if (p && r.indexOf(p) < 0) { //no loop
      //console.log(p.toString() + ' path '+ r.join(','));
      p.previousStates(r);
    }
  }

  toString() {
    return this.name;
  }
}

export interface IActionCompressor {
  matches(id: string) : boolean;
  toKey(action: ActionNode) : string;
  select(actions: ActionNode[]) : ActionNode;
}

class CompositeActionCompressor implements  IActionCompressor {
  constructor(private c : IActionCompressor[]) {

  }
  private choose(id: string) {
    return C.search(this.c, (ci) => ci.matches(id));
  }
  matches(id: string) : boolean {
    return this.choose(id) != null;
  }
  toKey(action: ActionNode) : string {
    return this.choose(action.f_id).toKey(action);
  }
  select(actions: ActionNode[]) : ActionNode {
    return this.choose(actions[0].f_id).select(actions);
  }
}

function createCompressor(path: ActionNode[]) {
  var toload = plugins.list('actionCompressor').filter((plugin) => {
    return path.some((action) => action.f_id.match(plugin.matches) != null);
  });
  return plugins.load(toload).then((loaded) => {
    return new CompositeActionCompressor(loaded.map((l) => l.factory()));
  });
}
/**
 * returns a compressed version of the paths where just the last selection operation remains
 * @param path
 */
export function compress(path: ActionNode[]) {
  return createCompressor(path).then((compressor) => {
    var group = {};
    path.forEach((action) => {
      var key;
      if (compressor.matches(action.f_id)) {
        key = compressor.toKey(action);
        if (!group.hasOwnProperty(key)) {
          group[key] = [action];
        } else {
          group[key].push(action);
        }
      }
    });
    var toremove = [];
    Object.keys(group).forEach((g) => {
      var gs = group[g];
      if (gs.length <= 1) { //nothing to compress
        return;
      }
      var last = compressor.select(gs);
      toremove.push.apply(toremove, gs.filter((gi) => gi !== last)); //mark all others to remove
    });
    if (toremove.length <= 0) {
      return path;
    }
    //filter all to remove ones
    path = path.filter((cmd) => toremove.indexOf(cmd) < 0);
    return path;
  });
}

function findCommon<T>(a: T[], b : T[]) {
  var c = 0;
  while(c < a.length && c < b.length && a[c] === b[c]) { //go to next till a difference
    c++;
  }
  if (c === 0) { //not even the root common
    return null;
  }
  return {
    i : c - 1,
    j: c - 1
  };
}

function asFunction(i) {
  if (!C.isFunction(i)) { //make a function
    return C.constant(i);
  }
  return i;
}
function toUnique(ids : string[]) {
  var help = {}; //use a dict
  ids.forEach((id) => help[id] = true);
  return Object.keys(help);
}

function createFactory(ids: string[]) {
  ids = toUnique(ids);
  var toload = plugins.list('actionFactory').filter((plugin) => {
    return ids.some((id) => id.match(plugin.creates) != null);
  });
  return plugins.load(toload).then((loaded) => {
    return createCompositeCmd(loaded.map((l) => <ICmdFunctionFactory>l.factory));
  });
}

export class ProvenanceGraph extends graph.GraphBase {
  actions : ActionNode[] = [];
  objects : ObjectNode<any>[] = [];
  states : StateNode[] = [];

  act : StateNode = null;
  private lastAction: ActionNode = null;

  constructor(desc: datatypes.IDataDescription) {
    super(desc);
    this.act = new StateNode('start');
    this.states.push(this.act);
    this.addNode(this.act);
  }

  get dim() {
    return [this.actions.length, this.objects.length, this.states.length];
  }

  ids(range: ranges.Range = ranges.all()) {
    return C.resolved(ranges.range([0,this.actions.length], [0, this.objects.length], [0, this.states.length]));
  }

  get idtypes() {
    return ['_provenance_actions', '_provenance_objects', '_provenance_states'].map(idtypes.resolve);
  }

  private createAction(meta: ActionMetaData, f_id : string, f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, inputs:IObjectRef<any>[] = [], parameter: any = {}) {
    var r = new ActionNode(meta, f_id, f, parameter);
    var inobjects = inputs.map((i) => this.findOrAddObject(i));
    this.actions.push(r);
    this.fire('add_action', r);
    this.addNode(r);
    inobjects.forEach((i) => this.addEdge(r, 'requires', i));
    return r;
  }

  createInverse(action: ActionNode, inverter: () => IAction) {
    var i = inverter.call(action);
    var c = this.createAction(i.meta, i.id, i.f, i.inputs, i.parameter);
    this.addEdge(action, 'inverse', c);
    this.addEdge(c, 'inverse', action);

    //create the loop in the states
    this.addEdge(action.resultsIn, 'next', c);
    this.addEdge(c, 'resultsIn', action.previous);

    return c;
  }

  push(action: IAction);
  push(meta: ActionMetaData, f_id: string, f : ICmdFunction, inputs:IObjectRef<any>[], parameter: any);
  push(arg : any, f_id: string = '', f : ICmdFunction = null, inputs:IObjectRef<any>[] = [], parameter: any = {}) {
    if (arg instanceof ActionMetaData) {
      return this.run(this.createAction(<ActionMetaData>arg, f_id, f, inputs, parameter));
    } else {
      var a = <IAction>arg;
      return this.run(this.createAction(a.meta, a.id, a.f, a.inputs || [], a.parameter || {}));
    }
  }

  addObject<T>(value: T, name: string = value ? value.toString(): 'Null', category = cat.data) {
    var r = this.addJustObject(value, name, category);
    this.addEdge(this.act, 'consistsOf', r);
    return r;
  }

  findObject<T>(value: T) {
    var r = C.search(this.objects, (obj) => obj.v === value);
    if (r) {
      return r;
    }
    return null;
  }

  private addJustObject<T>(value: T, name: string = value ? value.toString(): 'Null', category = cat.data) {
    var r = new ObjectNode<T>(value, name, category);
    this.objects.push(r);
    this.fire('add_object', r);
    return r;
  }

  private resolve(arr: IObjectRef<any>[]) {
    return arr.map((r) => this.findOrAddObject(r));
  }

  private findOrAddObject<T>(i: T) : ObjectNode<T>;
  private findOrAddObject<T>(i: IObjectRef<T>) : ObjectNode<T>;
  private findOrAddObject<T>(i: any) : ObjectNode<T> {
    var r;
    if (i instanceof ObjectNode) {
      return <ObjectNode<T>>i;
    }
    if (i.hasOwnProperty('v') && i.hasOwnProperty('name')) { //sounds like an proxy
      i.category = i.category || cat.data;
      r = C.search(this.objects, (obj) => obj.v === i.v && i.name === obj.name && i.category === obj.category);
      if (r) {
        return r;
      }
      return this.addJustObject(i.v, i.name, i.category);
    } else { //raw value
      r = C.search(this.objects, (obj) => obj.v === i);
      if (r) {
        return r;
      }
      return this.addJustObject(i);
    }
  }

  run(action: ActionNode) {
    var current = this.act,
      next : StateNode = action.resultsIn,
      newState = false;
    if (!next) { //create a new state
      newState = true;
      this.addEdge(current, 'next', action);
      next = this.makeState(action.meta.name + ' result');
      this.addEdge(action, 'resultsIn', next);
    }
    this.fire('execute', action);
    return action.execute(this).then((result) => {
      result = C.mixin({ created: [], removed: [], inverse: null}, result);
      this.fire('executed', action, result);

      var firstTime = !action.onceExecuted;
      action.onceExecuted = true;

      if (firstTime) {
        //create an link outputs
        var created = this.resolve(result.created);
        created.forEach((c) => this.addEdge(action, 'creates', c));
        var removed = this.resolve(result.removed);
        removed.forEach((c) => {
          c.v = null; //free reference
          this.addEdge(action, 'removes', c);
        });

        //update new state
        if (newState) {
          var objs = current.consistsOf;
          objs.push.apply(objs, created);
          removed.forEach((r) => {
            var i = objs.indexOf(r);
            objs.splice(i, 1);
          });
          objs.forEach((obj) => this.addEdge(next, 'consistsOf', obj));
        }
      } else {
        //update creates reference values
        action.creates.forEach((c, i) => {
          c.v = result.created[i].v;
        });
        action.removes.forEach((c) => c.v = null);
      }
      result.inverse = asFunction(result.inverse);
      action.updateInverse(this, result.inverse);

      var bak : any = this.act;
      this.act = next;
      this.fire('switch_state', next, bak);

      bak = this.lastAction;
      this.lastAction = action;
      this.fire('switch_action', action, bak);

      return {
        action: action,
        state: next,
        created: created,
        removed: removed
      };
    });
  }

  /**
   * execute a bunch of already executed actions
   * @param actions
   */
  private runChain(actions: ActionNode[]) {
    //actions = compress(actions, null);
    return compress(actions).then((torun) => {
      var r = C.resolved([]);
      torun.forEach((action) => {
        r = r.then((results) => this.run(action).then((result) => {
          results.push(result);
          return results;
        }));
      });
      return r;
    });
  }

  undo() {
    if (!this.lastAction) {
      return C.resolved(null);
    }
    return this.run(this.lastAction.getOrCreateInverse(this));
  }

  jumpTo(state: StateNode) {
    var actions : ActionNode[]  = [],
      act = this.act;
    if (act === state) { //jump to myself
      return C.resolved([]);
    }
    //lets look at the simple past
    var act_path = act.path,
      target_path = state.path;
    var common = findCommon(act_path, target_path);
    if (common) {
      var to_revert = act_path.slice(common.i + 1).reverse(),
        to_forward = target_path.slice(common.j + 1);
      actions = actions.concat(to_revert.map((r) => r.resultsFrom[0].getOrCreateInverse(this)));
      actions = actions.concat(to_forward.map((r) => r.resultsFrom[0]));
    }
    //no in the direct branches maybe in different loop instances?
    //TODO
    return this.runChain(actions);
  }

  private makeState(name: string) {
    var s= new StateNode(name);
    this.states.push(s);
    this.fire('add_state', s);
    this.addObject(s);
    return s;
  }

  persist() {
    var r : any = {
      root: this.desc.id
    };
    r.nodes = this._nodes.map((s,i) => s.persist(i));
    r.links = this._edges.map((l) => l.persist());
    return r;
  }

  restore(persisted: any) {
    createFactory(persisted.actions.map((action) => action.id)).then((factory) => {
      this.states = [];
      this.objects = [];
      this.actions = [];
      this._nodes = persisted.nodes.map((s) => {
        var r = null;
        if (s.type === 'state') {
          r = StateNode.restore(s);
          this.states.push(r);
        } else if (s.type === 'object') {
          r = ObjectNode.restore(s);
          this.objects.push(r);
        } else if (s.type === 'action') {
          r = ActionNode.restore(s, factory);
          this.actions.push(r);
        }
        return r;
      });
      this._edges = persisted.links.map((l) => graph.GraphEdge.restore(l, this._nodes));
    });
    return this;
  }
}


/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
export function create(desc: datatypes.IDataDescription): ProvenanceGraph {
  return new ProvenanceGraph(desc);
}

