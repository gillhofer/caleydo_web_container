/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('../caleydo/main');
import plugins = require('../caleydo/plugin');
import datatypes = require('../caleydo/datatype');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');
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

export enum CmdOperation {
  create, update, remove
}

function isType(type: string) {
  return (edge: ProvenanceEdge) => edge.type === type;
}

class ProvenanceNode {
  outgoing : ProvenanceEdge[] = [];
  incoming : ProvenanceEdge[] = [];

  pid : number = -1;

  constructor(public type: string) {

  }

  persist(id: number) : any {
    this.pid = id;
    return {

    };
  }
}

interface IObjectRef<T> {
  name: string;
  category : string;
  v : T;
}

export interface ICmdResult {
  inverse : () => IAction;
  created : IObjectRef<any>[];
  removed : IObjectRef<any>[];
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



class ObjectNode<T> extends ProvenanceNode implements IObjectRef<T> {
  constructor(public v : T, public name: string, public category = cat.data) {
    super('object');
  }

  get createdBy() {
    var r = this.incoming.filter(isType('creates'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get removedBy() {
    var r = this.incoming.filter(isType('removes'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get requiredBy() {
    return this.incoming.filter(isType('requires')).map((e) => <ActionNode>e.source);
  }

  get partOf() {
    return this.incoming.filter(isType('consistsOf')).map((e) => <StateNode>e.source);
  }
}

export class ActionMetaData {
  constructor(public category: string, public operation: CmdOperation, public name: string, public timestamp: number = Date.now(), public user: string = session.retrieve('user', 'Anonymous')) {

  }
}

export interface IAction {
  meta: ActionMetaData;
  id : string;
  f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult;
  inputs: IObjectRef<any>[];
  parameter: any;
}

class ActionNode extends ProvenanceNode {
  private inverter : () => IAction;
  onceExecuted = false;

  constructor(public meta: ActionMetaData, private f_id : string, private f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, public parameter: any = {}) {
    super('action');
  }

  get id() {
    return this.f_id;
  }

  get inverse() {
    var r = this.incoming.filter(isType('inverse'))[0];
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

  persist(): any {
    var r = {
      meta: this.meta,
      f : this.f_id,
      parameter: this.parameter
    };
    return r;
  }

  static restore(data: any, factory: ICmdFunctionFactory) {
    return new ActionNode(data.meta, data.id, factory(data.id), data.parameter);
  }

  get creates() {
    return this.outgoing.filter(isType('creates')).map((e) => <ObjectNode<any>>e.target);
  }

  get removes() {
    return this.outgoing.filter(isType('removes')).map((e) => <ObjectNode<any>>e.target);
  }

  get requires() {
    return this.outgoing.filter(isType('requires')).map((e) => <ObjectNode<any>>e.target);
  }

  get resultsIn() {
    var r = this.outgoing.filter(isType('resultsIn'))[0];
    return r ? <StateNode>r.target : null;
  }

  get previous() {
    var r = this.incoming.filter(isType('next'))[0];
    return r ? <StateNode>r.source : null;
  }
}

class StateNode extends ProvenanceNode{
  constructor(public name: string) {
    super('state');
  }

  get consistsOf() {
    return this.outgoing.filter(isType('consistsOf')).map((e) => <ObjectNode<any>>e.target);
  }

  get resultsFrom() {
    return this.incoming.filter(isType('resultsIn')).map((e) => <ActionNode>e.source);
  }

  get next() {
    return this.outgoing.filter(isType('next')).map((e) => <ActionNode>e.target);
  }

  get previousState() {
    var r = this.resultsFrom[0];
    if (r) {
      return r.previous;
    }
    return null;
  }

  get path() {
    var p = this.previousState,
      r : StateNode[] = [];
    if (p) {
      p.previousStates(r);
    }
    r.push(this);
    return r;
  }
  previousStates(r : StateNode[]) {
    var p = this.previousState;
    if (p) {
      p.previousStates(r);
    }
    r.push(this);
  }
}

class ProvenanceEdge {
  constructor(public type: string, public source: ProvenanceNode, public target: ProvenanceNode) {

  }
}

function toPid(n : ProvenanceNode) {
  return n ? n.pid : -1;
}
function byIndex<T>(arr: T[]) {
  return (i) => arr[i];
}



function remAll<T>(arr: T[], toremove: T[]) {
  toremove.forEach((r) => {
    var i = arr.indexOf(r);
    if (i >= 0) {
      arr.splice(i, 1);
    }
  });
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
    return this.choose(id) !== null;
  }
  toKey(action: ActionNode) : string {
    return this.choose(action.id).toKey(action);
  }
  select(actions: ActionNode[]) : ActionNode {
    return this.choose(actions[0].id).select(actions);
  }
}

/**
 * returns a compressed version of the paths where just the last selection operation remains
 * @param path
 */
export function compress(path: ActionNode[], compressor : IActionCompressor) {
  var group = {};
  path.forEach((action) => {
    var key;
    if (compressor.matches(action.id)) {
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
  }
}

export class ProvenanceGraph extends datatypes.DataTypeBase {
  private actions : ActionNode[] = [];
  private objects : ObjectNode<any>[] = [];
  private states : StateNode[] = [];
  private links : ProvenanceEdge[] = [];

  private act : StateNode = null;
  private lastAction: ActionNode = null;

  constructor(desc: datatypes.IDataDescription) {
    super(desc);
    this.act = new StateNode('start');
    this.states.push(this.act);
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

  createAction(meta: ActionMetaData, f_id : string, f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, inputs:IObjectRef<any>[] = [], parameter: any = {}) {
    var r = new ActionNode(meta, f_id, f, parameter);
    var inobjects = inputs.map((i) => this.findOrAddObject(i));
    this.actions.push(r);
    inobjects.forEach((i) => this.link(r, 'requires', i));
    this.fire('add_action', r);
    return r;
  }

  createInverse(action: ActionNode, inverter: () => IAction) {
    var i = inverter.call(action);
    var c = this.createAction(i.meta, i.id, i.f, i.inputs, i.parameter);
    this.link(action, 'inverse', c);
    this.link(c, 'inverse', action);

    //create the loop in the states
    this.link(action.resultsIn, 'next', c);
    this.link(c, 'resultsIn', action.previous);

    return c;
  }

  execute(meta: ActionMetaData, f_id: string, f : ICmdFunction, inputs:IObjectRef<any>[], parameter: any) {
    return this.run(this.createAction(meta, f_id, f, inputs, parameter));
  }

  addObject<T>(value: T, name: string = value ? value.toString(): 'Null', category = cat.data) {
    var r = new ObjectNode<T>(value, name, category);
    this.objects.push(r);
    this.link(this.act, 'consistsOf', r);
    this.fire('add_object', r);
    return r;
  }

  private resolve(arr: IObjectRef<any>[]) {
    return arr.map((r) => this.findOrAddObject(r));
  }

  private findOrAddObject<T>(i: IObjectRef<T>) : ObjectNode<T>{
    if (i instanceof ObjectNode) {
      return <ObjectNode<T>>i;
    }
    var r = C.search(this.objects, (obj) => obj.v === i.v && i.name === obj.name && i.category === obj.category);
    if (r) {
      return r;
    }
    return this.addObject(i.v, i.name, i.category);
  }

  private link(s : ProvenanceNode, type: string, t : ProvenanceNode) {
    var l = new ProvenanceEdge(type, s, t);
    s.outgoing.push(l);
    t.incoming.push(l);
    this.links.push(l);
    this.fire('add_link', l, type, s, t);
  }

  /**
   * first time adding of action
   * @param action
   * @returns {JQueryPromise<{action: ActionNode, state: StateNode, created: ObjectNode<any>[], removed: ObjectNode<any>[]}>}
   */
  private run(action: ActionNode) {
    var current = this.act,
      next : StateNode = action.resultsIn,
      newState = false;
    if (!next) { //create a new state
      newState = true;
      this.link(current, 'next', action);
      next = this.makeState(action.meta.name + ' result');
      this.link(action, 'resultsIn', next);
    }
    return action.execute(this).then((result) => {
      result = C.mixin({ created: [], removed: [], inverse: null}, result);

      var firstTime = !action.onceExecuted;
      action.onceExecuted = true;

      if (firstTime) {
        //create an link outputs
        var created = this.resolve(result.created);
        created.forEach((c) => this.link(action, 'creates', c));
        var removed = this.resolve(result.removed);
        removed.forEach((c) => {
          c.v = null; //free reference
          this.link(action, 'removes', c)
        });

        //update new state
        if (newState) {
          var objs = current.consistsOf;
          objs.push.apply(objs, created);
          removed.forEach((r) => {
            var i = objs.indexOf(r);
            objs.splice(i, 1);
          });
          objs.forEach((obj) => this.link(next, 'consistsOf', obj));
        }
      } else {
        //update creates reference values
        action.creates.forEach((c, i) => {
          c.v = result.created[i].v;
        });
        action.removes.forEach((c) => c.v = null);
      }
      action.updateInverse(this, result.inverse);
      this.act = next;
      this.lastAction = action;
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
    var r = C.resolved([]);
    actions.forEach((action) => {
      r = r.then((results) => this.run(action).then((result) => {
        results.push(result);
        return results;
      }));
    });
    return r;
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
      actions = actions.concat(to_forward.map((r) => r.next[0]));
    }
    //no in the direct branches maybe in different loop instances?
    //TODO
    return this.runChain(actions);
  }

  private makeState(name: string) {
    var s= new StateNode(name);
    this.states.push(s);
    this.fire('add_state', s);
    return s;
  }

  private switchAndCopyState(state: StateNode) {
    var bak = this.act;
    if (bak === state) {
      return;
    }
    bak.consistsOf.forEach((o) => this.link(state, 'consistsOf', state));
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

