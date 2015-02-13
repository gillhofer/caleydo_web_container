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

export function inverseOperation(op:CmdOperation) {
  switch (op) {
    case CmdOperation.create:
      return CmdOperation.remove;
    case CmdOperation.remove:
      return CmdOperation.create;
    default:
      return CmdOperation.update;
  }
}

/**
 * id by category
 */
export interface IObjectRef<T> {
  /**
   * category for simpler visualization
   */
  category: string;
  /**
   *
   */
  name: string;
  /**
   * the actual value
   */
  v: T;
}

export function createRef<T>(value: T, name='Unknown', category = cat.data) : IObjectRef<T> {
  return {
    category: category,
    name: name,
    v: value
  };
}

export interface ICmdResult {
  inverse : Cmd;
  created : IObjectRef<any>[];
  removed : IObjectRef<any>[];
}

//how to find the corresponding inputs -- attach it to the object

export interface ICmdMetaData {
  category: string;
  operation: CmdOperation;
  name: string;
  timestamp: number;
  user: string;
}

export class CmdMetaData implements ICmdMetaData {
  constructor(public category: string, public operation: CmdOperation, public name: string, public timestamp: number, public user: string) {

  }
}

export function meta(name: string, category: string = cat.data, operation: CmdOperation = CmdOperation.update, user: string = session.retrieve('user','Unknown'), timestamp: number = Date.now()) {
  return new CmdMetaData(category, operation, name, timestamp, user);
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

export class Cmd {
  constructor(public meta: ICmdMetaData, private f_id : string, private f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, public inputs:IObjectRef<any>[] = [], public parameter: any = {}) {

  }

  get id() {
    return this.f_id;
  }

  execute(graph: ProvenanceGraph):C.IPromise<ICmdResult> {
    var r = this.f(this.inputs, this.parameter, graph);
    return C.asPromise(r);
  }

  equals(that:Cmd):boolean {
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
    return new Cmd(data.meta, data.id, factory(data.id), [], data.parameter);
  }
}

export function cmd(meta: ICmdMetaData, f_id : string, f : (inputs: IObjectRef<any>[], parameters: any, graph: ProvenanceGraph) => ICmdResult, inputs:IObjectRef<any>[] = [], parameter: any = {}) {
  return new Cmd(meta, f_id, f, inputs, parameter);
}


class ProvenanceNode {
  pid : number = -1;

  constructor(public type: string) {

  }

  persist(id: number) : any {
    this.pid = id;
    return {

    };
  }
  persistLinks(p: any): void {
    //nothing to do
  }

  restoreLinks(p: any, nodes: CmdNode[], states: StateNode[], objects: ObjectNode[]) {
    //nothing to do
  }
}

function toPid(n : ProvenanceNode) {
  return n ? n.pid : -1;
}
function byIndex<T>(arr: T[]) {
  return (i) => arr[i];
}

export class CmdNode extends ProvenanceNode {
  next : CmdNode[] = [];

  requires : ObjectNode[] = [];
  produces : ObjectNode[] = [];

  inverse: Cmd;

  constructor(public cmd: Cmd, public previous : CmdNode) {
    super('cmd');
    if (this.previous) {
      this.previous.next.push(this);
    }
  }

  get name() {
    return this.cmd.meta.name;
  }

  get category() {
    return this.cmd.meta.category;
  }

  static restore(p: any, factory: ICmdFunctionFactory) {
    if (p.cmd.meta.name === 'root') {
      return new RootNode();
    }
    return new CmdNode(Cmd.restore(p.cmd, factory), null);
  }

  get isRoot() {
    return this.previous === this;
  }

  execute(graph: ProvenanceGraph):C.IPromise<ICmdResult> {
    this.cmd.inputs = this.requires.map((r) => r.ref);
    return this.cmd.execute(graph).then((r) => {
      this.cmd.inputs = null; //reset
      return r;
    });
  }

  get path() {
    var r = [],
      act = this;
    while (!act.isRoot) {
      r.push(act);
      act = act.previous;
    }
    r = r.reverse();
    return r;
  }

  persist(id: number) {
    var r = super.persist(id);
    r.cmd = this.cmd.persist();
    return r;
  }

  persistLinks(p: any) {
    p.previous = toPid(this.previous);
    p.next = this.next.map(toPid);
    p.requires = this.requires.map(toPid);
    p.produces = this.produces.map(toPid);
  }

  restoreLinks(p: any, nodes: CmdNode[], states: StateNode[], objects: ObjectNode[]) {
    this.previous = nodes[p.previous];
    this.next = p.next.map(byIndex(nodes));
    this.requires = p.requires.map(byIndex(objects));
    this.produces = p.produces.map(byIndex(objects));
  }
}


export class ObjectNode extends ProvenanceNode {
  usedBy : { node: CmdNode; index: number; }[] = [];
  removedBy : CmdNode;

  name: string;
  category : string;

  constructor(public ref : IObjectRef<any>, public createdBy : CmdNode) {
    super('object');
    //backup as the ref is transient
    if (ref) {
      this.category = this.ref.category;
      this.name = this.ref.name;
    }
  }

  static restore(p: any) {
    var r = new ObjectNode(null, null);
    r.category = p.category;
    r.name = p.name;
    return r;
  }

  persist(id: number) {
    var r = super.persist(id);
    r.name = this.name;
    r.category = this.category;
    return r;
  }

  persistLinks(p: any) {
    p.createdBy = toPid(this.createdBy);
    p.usedBy = this.usedBy.map((n) => { return { node: toPid(n.node), index: n.index}; });
    p.removedBy = toPid(this.removedBy);
  }
}

export class StateNode extends ProvenanceNode {
  constructor(public name: string, public resultOf: CmdNode, public consistsOf : ObjectNode[]) {
    super('state');
  }

  static restore(p: any) {
    return new StateNode(p.name, null, []);
  }

  persist(id: number) {
    var r = super.persist(id);
    r.name = this.name;
    return r;
  }

  persistLinks(p: any) {
    p.resultOf = toPid(this.resultOf);
    p.consistsOf = this.consistsOf.map(toPid);
  }
}

class RootNode extends CmdNode {
  constructor() {
    super(RootNode.createDummyCmd(), null);
    this.previous = this;
  }

  static createDummyCmd() {
    var cmd,
       root : any = function () {
      return {
        inverse : cmd,
        created : [],
        removed : []
      };
    };
    cmd = new Cmd(new CmdMetaData(cat.logic, CmdOperation.update, 'root', 0, 'system'), 'root', root);
    return cmd;
  }
}

function remAll<T>(arr: T[], toremove: T[]) {
  toremove.forEach((r) => {
    var i = arr.indexOf(r);
    if (i >= 0) {
      arr.splice(i, 1);
    }
  });
}

export interface ICmdCompressor {
  matches(id: string) : boolean;
  toKey(cmd: Cmd) : string;
  select(cmds: Cmd[]) : Cmd;
}

class CompositeCmdCompressor implements  ICmdCompressor {
  constructor(private c : ICmdCompressor[]) {

  }
  private choose(id: string) {
    return C.search(this.c, (ci) => ci.matches(id));
  }
  matches(id: string) : boolean {
    return this.choose(id) !== null;
  }
  toKey(cmd: Cmd) : string {
    return this.choose(cmd.id).toKey(cmd);
  }
  select(cmds: Cmd[]) : Cmd {
    return this.choose(cmds[0].id).select(cmds);
  }
}

/**
 * returns a compressed version of the paths where just the last selection operation remains
 * @param path
 */
export function compress(path: CmdNode[], compressor : ICmdCompressor) {
  var group = {};
  path.forEach((cmd) => {
    var key;
    if (compressor.matches(cmd.cmd.id)) {
      key = compressor.toKey(cmd.cmd);
      if (!group.hasOwnProperty(key)) {
        group[key] = [cmd];
      } else {
        group[key].push(cmd);
      }
    }
  });
  var toremove = [];
  Object.keys(group).forEach((g) => {
    var gs = group[g];
    if (gs.length <= 1) { //nothing to compress
      return;
    }
    var last = compressor.select(gs.map((d) => d.cmd));
    toremove.push.apply(toremove, gs.filter((gi) => gi.cmd !== last)); //mark all others to remove
  });
  if (toremove.length <= 0) {
    return path;
  }
  //filter all to remove ones
  path = path.filter((cmd) => toremove.indexOf(cmd) < 0);
  return path;
}

export class ProvenanceGraph extends datatypes.DataTypeBase {
  private cmds : CmdNode[] = [];
  private objects : ObjectNode[] = [];
  private states : StateNode[] = [];
  private act = null;

  constructor(desc: datatypes.IDataDescription) {
    super(desc);
    this.act = new StateNode('main', new RootNode(), []);
    this.cmds.push(this.act.resultOf);
    this.states.push(this.act);
  }

  get dim() {
    return [this.cmds.length, this.objects.length, this.states.length];
  }

  ids(range: ranges.Range = ranges.all()) {
    return C.resolved(ranges.range([0,this.cmds.length], [0, this.objects.length], [0, this.states.length]));
  }

  get idtypes() {
    return ['_provenance_nodes', '_provenance_objects', '_provenance_states'].map(idtypes.resolve);
  }

  execute(meta: ICmdMetaData, f_id: string, f : ICmdFunction, inputs:IObjectRef<any>[], parameter: any) {
    return this.push(new Cmd(meta, f_id, f, inputs, parameter));
  }

  addObject<T>(value: T, name: string, category = cat.data, creator = this.root) {
    var r = new ObjectNode(createRef(value, name, category), this.root);
    this.objects.push(r);
    this.fire('add_object', r);
    return r.ref;
  }

  private run(cmds: Cmd[]) {
    cmds = this.compress(cmds);
    var r = C.resolved(null);
    cmds.forEach((cmd) => {
      r = r.then(() => this.runOne(cmd));
    });
    return r;
  }
  private runOne(cmd: Cmd) {
    this.fire('execute', cmd);
    return cmd.execute(this).then((result) => {
      result = C.mixin({ created: [], removed: [], inverse: null}, result);
      this.fire('executed', cmd, result);
      //TODO check for similar ones
      node.produces = result.created.map((ref) => {
        var c = new ObjectNode(ref, node);
        this.objects.push(c);
        this.fire('add_object', c);
        return c;
      });

      this.walkImpl(node, result);
      return result;
    });
  }

  push(cmd: Cmd) {
    var node = new CmdNode(cmd, this.last);
    this.cmds.push(node);
    this.fire('add_node', node);
    node.requires = cmd.inputs.map((id, i) => {
      var r = this.byID(id);
      if (!r) {
        r = new ObjectNode(id, this.root);
        this.objects.push(r);
        this.fire('add_object', r);
      }
      //create one on the fly and associate it with the root
      r.usedBy.push({node: node, index: i});
      return r;
    });

    this.fire('execute', cmd);
    return cmd.execute(this).then((result) => {
      result = C.mixin({ created: [], removed: [], inverse: null}, result);
      this.fire('executed', cmd, result);
      //TODO check for similar ones
      node.produces = result.created.map((ref) => {
        var c = new ObjectNode(ref, node);
        this.objects.push(c);
        this.fire('add_object', c);
        return c;
      });

      this.walkImpl(node, result);
      return result;
    });
  }

  private walkImpl(node: CmdNode, result: ICmdResult) {
    var toId =(id) => this.byID(id);

    node.inverseCmd = result.inverse;

    //update references
    node.produces.forEach((n, i) => n.ref = result.created[i]);

    //add to active objects
    this.act.consistsOf.push.apply(this.act.consistsOf, node.produces);

    //remove from active objects
    var rem = result.removed.map(toId);
    rem.forEach((r) => {
      r.removedBy = node;
      this.fire('remove_object', r);
      r.ref = null; //free the reference
    });
    remAll(this.act.consistsOf, rem);

    this.last = node;
  }

  redo(node: CmdNode) {
    //assert this.last.next.indexOf(node) >= 0
    this.fire('execute', node.cmd);
    return node.cmd.execute(this).then((r) => {
      this.fire('executed', node.cmd, r);
      //update with the new values
      this.walkImpl(node, r);
      return r;
    });
  }

  redoAll(path: CmdNode[]) {
    //TODO optimize path by removing redundancies
    this.fire('redoAll', path);
    var r = C.resolved(null);
    path.forEach((todo) => r = r.then(() => this.redo(todo)));
    return r.then(() => {
      this.fire('redoAlled', path);
    });
  }

  undo() {
    if (this.last.isRoot) { //nothing to undo
      return;
    }
    var toUndo = this.last;
    this.fire('undo', toUndo);
    this.push(toUndo.inverse).then(() => {
      var undoed = this.last;
      //change the root to its grandparent and create a cycle
      var grand = toUndo.previous;

      //free result

      undoed.inverse = toUndo.cmd;

      undoed.next.push(grand);
      this.last = grand; //back at the grand parent
      this.fire('undoed', toUndo);
    });
  }

  undoAll(path: CmdNode[]) {
    //TODO optimize path by removing redundancies
    this.fire('undoAll', path);
    var r = C.resolved(null);
    path.forEach(() => r = r.then(() => this.undo()));
    return r.then(() => {
      this.fire('undoAlled', path);
    });
  }

  get activeObjects() {
    return this.act.consistsOf;
  }

  findObject<T>(v : T) : IObjectRef<T> {
    var r = C.search(this.objects, (d) => d.ref.v === v).ref;
    if (r) {
      return r;
    }
    return this.addObject(v, v.toString());
  }

  takeSnapshot(name: string) {
    var s = new StateNode(name,  this.act.resultOf, this.act.consistsOf.slice());
    this.states.push(s);
    this.fire('add_state', s);
  }

  private byID(id : IObjectRef<any>) {
    return C.search(this.objects, (active) => active.ref === id);
  }

  get actState() {
    return this.act;
  }

  get last(): CmdNode {
    return this.act.resultOf;
  }

  set last(cmd: CmdNode) {
    this.act.resultOf = cmd;
    this.fire('switch', cmd, this.last);
  }

  get allCmds() {
    return this.cmds;
  }

  get root() {
    return this.cmds[0];
  }

  get allStates() {
    return this.states;
  }

  get allObjects() {
    return this.objects;
  }

  jumpTo(node: CmdNode) {
    var target = node.path,
      l = this.last,
      i: number,
      current: CmdNode[];
    this.fire('jumpTo', node);
    if (node === l) {
      return C.resolved(null);
    }
    if ( (i = target.indexOf(l)) >= 0) { //go forward multiple steps
      return this.redoAll(target.slice(i+1));
    }
    current = l.path;
    if ((i = current.indexOf(node)) >= 0) { //go back multiple steps
      return this.undoAll(current.slice(i+1).reverse());
    }

    //some other branch find common ancestor undo to it and then find
    for(i = 0; i < target.length; ++i) {
      if (target[i] !== current[i]) { //found different branch point
        var r = this.undoAll(current.slice(i+1).reverse()); //jump to common one
        r = <any>r.then(() => this.redoAll(target.slice(i+1))); //jump to real target
        return r;
      }
    }
    //error not a common sub path
    return C.reject('no common path found');
  }

  persist(): any {
    var r = {
      nodes: this.cmds.map((n, i) => n.persist(i)),
      states: this.states.map((n, i) => n.persist(i)),
      objects: this.objects.map((n, i) => n.persist(i)),
      act: this.act.pid
    };
    this.cmds.forEach((n, i) => n.persistLinks(r.nodes[i]));
    this.states.forEach((n, i) => n.persistLinks(r.states[i]));
    this.objects.forEach((n, i) => n.persistLinks(r.states[i]));

    return r;
  }

  restore(p : any) {
    var factories = plugins.list('cmdFactory');
    //var toLoad = factories;

    //FIXME since async load first all needed plugins and then do the magic
    var factory = (id) => {
      var i, r;
      for(i = 0; i < factories.length; ++i) {
        if ((r = factories[i](id))) {
          return r;
        }
      }
      return null;
    };
    this.cmds = p.cmds.map((n) => CmdNode.restore(n, factory));
    this.states = p.states.map((n) => StateNode.restore(n));
    this.objects = p.objects.map((n) => ObjectNode.restore(n));
    this.act = this.states[p.act];

    this.cmds.forEach((n, i) => n.restoreLinks(p.cmds[i], this.cmds, this.states, this.objects));
    this.states.forEach((n, i) => n.restoreLinks(p.states[i], this.cmds, this.states, this.objects));
    this.objects.forEach((n, i) => n.restoreLinks(p.objects[i], this.cmds, this.states, this.objects));
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

