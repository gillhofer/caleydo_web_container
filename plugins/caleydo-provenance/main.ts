/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('../caleydo/main');
import plugins = require('../caleydo/plugin');
import events = require('../caleydo/event');
import datatypes = require('../caleydo/datatype');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');

var categories = {
  data: {
    name: 'Data',
    description: '',
    color: 'red'
  },
  selection: {
    name: 'Selection',
    description: '',
    color: 'orange'
  },
  visual: {
    name: 'Visual Encoding',
    description: '',
    color: 'yellow'
  },
  layout: {
    name: 'Layout',
    description: '',
    color: 'green'
  },
  logic: {
    name: 'Logic',
    description: '',
    color: 'grey'
  },
  custom: {
    name: 'Custom',
    description: '',
    color: 'white'
  }
};

export enum CmdCategory {
  data, selection, visual, logic, note, custom
}
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
export interface CmdID {
  /**
   * category for simpler visualization
   */
  category: CmdCategory;
  /**
   *
   */
  name: string;
  /**
   * the actual value
   */
  value: any;
}

export interface CmdResult {
  inverse : Cmd;
  created : CmdID[];
  removed : CmdID[];
}

//how to find the corresponding inputs -- attach it to the object

export interface ICmdMetaData {
  category: CmdCategory;
  operation: CmdOperation;
  name: string;
  timestamp: number;
  user: string;
}

export class CmdMetaData implements ICmdMetaData {
  constructor(public category: CmdCategory, public operation: CmdOperation, public name: string, public timestamp: number, public user: string) {

  }
}

export interface ICmdFunction {
  id: string;
  (inputs: CmdID[], parameters: any) : CmdResult
}

export interface ICmdFunctionFactory {
  (id: string): ICmdFunction;
}

export class Cmd {
  constructor(public meta: ICmdMetaData, private f : ICmdFunction, public inputs:CmdID[] = [], private parameter: any = {}) {

  }

  execute():CmdResult {
    return this.f(this.inputs, this.parameter);
  }

  equals(that:Cmd):boolean {
    if (!(this.meta.category === that.meta.category && that.meta.operation === that.meta.operation)) {
      return false;
    }
    if (this.f.id !== that.f.id) {
      return false
    }
    //TODO check parameters if they are the same
    return true;
  }

  persist(): any {
    var r = {
      meta: this.meta,
      f : this.f.id,
      parameter: this.parameter
    }
    return r;
  }

  static restore(data: any, factory: ICmdFunctionFactory) {
    return new Cmd(data.meta, factory(data.id), [], data.parameter);
  }
}

class ProvenanceNode {
  pid : number = -1;
  persist(id: number) : any {
    this.pid = id;
    return {

    }
  }
  persistLinks(p: any): void {

  }

  restoreLinks(p: any, nodes: CmdNode[], states: StateNode[], cmdids: CmdIDNode[]) {

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

  requires : CmdIDNode[] = [];
  produces : CmdIDNode[] = [];

  inverse: Cmd;

  constructor(public cmd: Cmd, public previous : CmdNode) {
    super();
    if (this.previous) {
      this.previous.next.push(this);
    }
  }

  static restore(p: any, factory: ICmdFunctionFactory) {
    if (p.cmd.meta.name === 'root') {
      return new RootNode();
    }
    return new CmdNode(Cmd.restore(p.cmd, factory), null)
  }

  get isRoot() {
    return this.previous === this;
  }

  execute():CmdResult {
    this.cmd.inputs = this.requires.map((r) => r.id);
    var r = this.cmd.execute();
    this.cmd.inputs = null; //reset
    return r;
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

  restoreLinks(p: any, nodes: CmdNode[], states: StateNode[], cmdids: CmdIDNode[]) {
    this.previous = nodes[p.previous];
    this.next = p.next.map(byIndex(nodes));
    this.requires = p.requires.map(byIndex(cmdids));
    this.produces = p.produces.map(byIndex(cmdids));
  }

}

export class CmdIDNode extends ProvenanceNode {
  usedBy : { node: CmdNode; index: number; }[] = [];
  removedBy : CmdNode;

  constructor(public id : CmdID, public createdBy : CmdNode) {
    super();
  }

  static restore(p: any) {
    return new CmdIDNode(p.id, null);
  }

  persist(id: number) {
    var r = super.persist(id);
    r.id = this.id;
    return r;
  }

  persistLinks(p: any) {
    p.createdBy = toPid(this.createdBy);
    p.usedBy = this.usedBy.map((n) => { return { node: toPid(n.node), index: n.index} });
    p.removedBy = toPid(this.removedBy);
  }
}

export class StateNode extends ProvenanceNode {
  constructor(public name: string, public resultOf: CmdNode, public consistsOf : CmdIDNode[]) {
    super();
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
    root.id = 'root';
    cmd = new Cmd(new CmdMetaData(CmdCategory.logic, CmdOperation.update, 'root', 0, 'system'), root);
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

export class ProvenanceGraph extends datatypes.DataTypeBase {
  private nodes : CmdNode[] = [];
  private cmdids : CmdIDNode[] = [];
  private states : StateNode[] = [];
  private act = null;

  constructor(desc: datatypes.IDataDescription) {
    super(desc);
    this.act = new StateNode('main', new RootNode(), []);
    this.nodes.push(this.act.resultOf);
    this.states.push(this.act);
  }

  get dim() {
    return [this.nodes.length, this.cmdids.length, this.states.length];
  }

  ids(range: ranges.Range = ranges.all()) {
    return C.resolved(ranges.range([0,this.nodes.length], [0, this.cmdids.length], [0, this.states.length]));
  }

  get idtypes() {
    return ['_provenance_nodes', '_provenance_cmdids', '_provenance_states'].map(idtypes.resolve);
  }

  execute(meta: ICmdMetaData, f : ICmdFunction, inputs:CmdID[], parameter: any) {
    return this.push(new Cmd(meta, f, inputs, parameter));
  }

  push(cmd: Cmd) {
    var toId =(id) => this.byID(id);
    var node = new CmdNode(cmd, this.act.resultOf);
    this.fire('add_node', node);
    this.nodes.push(node);
    node.requires = cmd.inputs.map(toId);

    this.fire('execute', cmd);
    var result = cmd.execute();
    this.fire('executed', cmd, result);
    //TODO check for similar ones
    node.produces = result.created.map((id) => {
      var c = new CmdIDNode(id, node);
      this.fire('add_id', c);
      return c;
    });

    this.cmdids.push.apply(this.cmdids, node.produces);

    this.walkImpl(node, result);

    return result;
  }

  private walkImpl(node: CmdNode, result: CmdResult) {
    var toId =(id) => this.byID(id);

    node.inverse = result.inverse;

    node.produces.forEach((n, i) => n.id = result.created[i]);

    this.act.consistsOf.push.apply(this.act.consistsOf, node.produces);

    var rem = result.removed.map(toId);
    rem.forEach((r) => {
      r.removedBy = node;
      this.fire('remove_id', r);
      r.id = null; //free the id itself
    });
    remAll(this.act.consistsOf, rem);

    this.last = node;
  }

  redo(node: CmdNode) {
    //assert this.last.next.indexOf(node) >= 0
    this.fire('execute', node.cmd);
    var r = node.cmd.execute();
    this.fire('executed', node.cmd, r);
    //update with the new values
    this.walkImpl(node, r);
    return r;
  }

  redoAll(path: CmdNode[]) {
    //TODO optimize path by removing redundancies
    this.fire('redoAll', path);
    path.forEach((todo) => this.redo(todo));
    this.fire('redoAlled', path);
  }

  undo() {
    if (this.act.resultOf.isRoot) { //nothing to undo
      return;
    }
    var toUndo = this.last;
    this.fire('undo', toUndo);
    this.push(toUndo.inverse);
    var undoed = this.last;
    //change the root to its grandparent and create a cycle
    var grand = toUndo.previous;

    //free result

    undoed.inverse = toUndo.cmd;

    undoed.next.push(grand);
    this.last = grand; //back at the grand parent
    this.fire('undoed', toUndo);
  }

  undoAll(path: CmdNode[]) {
    //TODO optimize path by removing redundancies
    this.fire('undoAll', path);
    path.forEach(() => this.undo());
    this.fire('undoAlled', path);
  }

  get activeCmdIds() {
    return this.act.consistsOf;
  }

  takeSnapshot(name: string) {
    var s = new StateNode(name,  this.act.resultOf, this.act.consistsOf.slice());
    this.states.push(s);
    this.fire('add-state', s);
  }

  private byID(id : CmdID) {
    return C.search(this.cmdids, (active) => active.id == id);
  }

  get last(): CmdNode {
    return this.act.resultOf;
  }

  set last(cmd: CmdNode) {
    this.act.resultOf = cmd;
    this.fire('switch', cmd, this.last);
  }

  get allNodes() {
    return this.nodes;
  }

  get root() {
    return this.nodes[0];
  }

  get allStates() {
    return this.states;
  }

  jumpTo(node: CmdNode) {
    var target = node.path,
      l = this.last,
      i: number,
      current: CmdNode[];
    this.fire('jumpTo', node);
    if (node == l) {
      return;
    }
    if ( (i = target.indexOf(l)) >= 0) { //go forward multiple steps
      this.redoAll(target.slice(i+1));
    }
    current = l.path;
    if ((i = current.indexOf(node)) >= 0) { //go back multiple steps
      this.undoAll(current.slice(i+1).reverse());
      return;
    }

    //some other branch find common ancestor undo to it and then find
    for(i = 0; i < target.length; ++i) {
      if (target[i] !== current[i]) { //found different branch point
        this.undoAll(current.slice(i+1).reverse()); //jump to common one
        this.redoAll(target.slice(i+1)); //jump to real target
        return;
      }
    }
    //error not a common sub path
  }

  persist(): any {
    var r = {
      nodes: this.nodes.map((n, i) => n.persist(i)),
      states: this.states.map((n, i) => n.persist(i)),
      cmdids: this.cmdids.map((n, i) => n.persist(i)),
      act: this.act.pid
    };
    this.nodes.forEach((n, i) => n.persistLinks(r.nodes[i]));
    this.states.forEach((n, i) => n.persistLinks(r.states[i]));
    this.states.forEach((n, i) => n.persistLinks(r.states[i]));

    return r;
  }

  restore(p : any) {
    var factories = plugins.list('cmdFactory');
    var factory = (id) => {
      var i, r;
      for(i = 0; i < factories.length; ++i) {
        if ((r = factories[i](id))) {
          return r;
        }
      }
      return null;
    };
    this.nodes = p.nodes.map((n) => CmdNode.restore(n, factory));
    this.states = p.states.map((n) => StateNode.restore(n));
    this.cmdids = p.cmdids.map((n) => CmdIDNode.restore(n));
    this.act = this.states[p.act];

    this.nodes.forEach((n, i) => n.restoreLinks(p.nodes[i], this.nodes, this.states, this.cmdids));
    this.states.forEach((n, i) => n.restoreLinks(p.states[i], this.nodes, this.states, this.cmdids));
    this.cmdids.forEach((n, i) => n.restoreLinks(p.cmdids[i], this.nodes, this.states, this.cmdids));
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

