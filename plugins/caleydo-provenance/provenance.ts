/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('../caleydo/main');
import plugins = require('../caleydo/plugin');

export interface IPersistable {
  /**
   * persist the current configuration and return
   */
  persist(): any;
  /**
   * restores from stored persisted state
   * @param persisted a result of a previous persist call
   * @return the restored view or null if it could be in place restored
   */
  restore(persisted:any) : IPersistable;
}

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

export interface Edge {
  type: string; //dependency,
  s: CommandNode;
  t: CommandNode;
}


/**
 * a basic command interface
 */
export interface IPersistableCommand extends idtypes.IHasUniqueId {

  category: string;

  type: string;

  dependencies : IPersistableCommand[];

  /**
   * persists this cmd to a JSON compatible format
   */
  persist(): any;

  /**
   * runs this cmd
   */
  execute() : void;

  /**
   * inverse cmd to revert this one
   */
  inverse : IPersistableCommand;
}

interface CommandNode {
  cmd: IPersistableCommand;

  //graph
  previous: CommandNode;
  next : CommandNode[];

  dependencies : CommandNode[];

}

enum CmdCategory {
  data, selection, visual, logic, note, custom
}
enum CmdOperation {
  create, update, remove
}

function inverseOperation(op:CmdOperation) {
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
interface CmdID {
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

interface CmdResult {
  inverse : Cmd;
  created : CmdID[];
  removed : CmdID[];
}

//how to find the corresponding inputs -- attach it to the object

interface ICmdMetaData {
  category: CmdCategory;
  operation: CmdOperation;
  name: string;
  timestamp: number;
  user: string;
}

class CmdMetaData implements ICmdMetaData {
  constructor(public category: CmdCategory, public operation: CmdOperation, public name: string, public timestamp: number, public user: string) {

  }
}

interface ICmdFunction {
  id: string;
  (inputs: CmdID[], parameters: any) : CmdResult
}

interface ICmdFunctionFactory {
  create(id: string): ICmdFunction;
}

class Cmd {
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
}

class CmdNode {
  next : CmdNode[] = [];

  requires : CmdIDNode[] = [];
  produces : CmdIDNode[] = [];

  inverse: Cmd;

  constructor(public cmd: Cmd, public previous : CmdNode) {
    if (this.previous) {
      this.previous.next.push(this);
    }
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
}

class CmdIDNode {
  usedBy : { node: CmdNode; index: number; }[] = [];
  removedBy : CmdNode;

  constructor(public id : CmdID, public createdBy : CmdNode) {

  }
}

class StateNode {
  constructor(public name: string, public resultOf: CmdNode, public consistsOf : CmdID[]) {

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

class CmdStack {
  private nodes : CmdNode[] = [];
  private ids : CmdIDNode[] = [];
  private states : StateNode[] = [];
  private act = new StateNode('main', new RootNode(), []);

  constructor() {
    this.nodes.push(this.act.resultOf);
    this.states.push(this.act);
  }

  execute(meta: ICmdMetaData, f : ICmdFunction, inputs:CmdID[], parameter: any) {
    return this.push(new Cmd(meta, f, inputs, parameter));
  }

  push(cmd: Cmd) {
    var toId =(id) => this.byID(id);
    var node = new CmdNode(cmd, this.act.resultOf);
    this.nodes.push(node);
    node.requires = cmd.inputs.map(toId);

    var result = cmd.execute();

    //TODO check for similar ones
    node.produces = result.created.map((id) => new CmdIDNode(id, node));

    this.ids.push.apply(this.ids, node.produces);

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
      r.id = null; //free the id itself
      r.removedBy = node;
    });
    remAll(this.act.consistsOf, rem);

    this.act.resultOf = node;
  }

  redo(node: CmdNode) {
    //assert this.last.next.indexOf(node) >= 0
    var r = node.execute();
    //update with the new values
    this.walkImpl(node, r);
    return r;
  }

  redoAll(path: CmdNode[]) {
    //TODO optimize code
    path.forEach((todo) => this.redo(todo));
  }

  undo() {
    if (this.act.resultOf.isRoot) { //nothing to undo
      return;
    }
    var toUndo = this.last;
    this.push(toUndo.inverse);
    var undoed = this.last;
    //change the root to its grandparent and create a cycle
    var grand = toUndo.previous;

    //free result

    undoed.inverse = toUndo.cmd;

    undoed.next.push(grand);
    undoed = grand; //back at the grand parent
  }

  undoAll(path: CmdNode[]) {
    path.forEach(() => this.undo());
  }

  get activeIDs() {
    return this.act.consistsOf;
  }

  takeSnapshot(name: string) {
    this.states.push(new StateNode(name,  this.act.resultOf, this.act.consistsOf.slice()));
  }

  private byID(id : CmdID) {
    return C.search(this.ids, (active) => active.id == id);
  }

  get last(): CmdNode {
    return this.act.resultOf;
  }

  set last(cmd: CmdNode) {
    this.act.resultOf = cmd;
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
  }
}
