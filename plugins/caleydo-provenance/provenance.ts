/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('../caleydo/main');
import plugins = require('../caleydo/plugin');
import idtypes = require('../caleydo/idtype');

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
  result : CmdResult;
  next : CmdNode[] = [];
  in_references : CmdIDNode[] = [];
  out_references = Cmd

  constructor(public cmd: Cmd, public previous : CmdNode) {
    if (this.previous) {
      this.previous.next.push(this);
    }
  }
}

class CmdIDNode {
  usedBy : CmdNode[] = [];

  constructor(public id : CmdID, public createdBy : CmdNode, public index : number) {

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

class CmdStack {
  private activeIDs : CmdIDNode[];
  private act : CmdNode = new RootNode();

  execute(meta: ICmdMetaData, f : ICmdFunction, inputs:CmdID[], parameter: any) {
    return this.push(new Cmd(meta, f, inputs, parameter));
  }

  push(cmd: Cmd) {
    var node = new CmdNode(cmd, this.act);
    node.references = this.scanInputs(cmd.inputs, node);
    node.result = cmd.execute();
    this.integrateResult(node.result, node);
    this.act = node;
    return node.result;
  }

  private scanInputs(inputs : CmdID[], node: CmdNode) {
    return inputs.map((input) => {
      var id = this.byID(input);
      id.usedBy.push(node);
      return id;
    });
  }

  private byID(id : CmdID) {
    return C.search(this.activeIDs, (active) => active.id == id);
  }

  undo() {
    if (!this.act) { //nothing to undo
      return;
    }
    var node = this.act;
    this.push(node.result.inverse);
    //change the root to its grandparent and create a cycle
    var grand = node.previous.previous;

    //clear the result and optimize the graph
    this.deleteResult(this.act);
    this.deleteResult(node);

    this.act.next.push(grand);
    this.act = grand; //back at the grand parent
  }

  private deleteResult(n : CmdNode) {

    n.result = null;
  }

  private integrateResult(r : CmdResult, node: CmdNode) {
    var ids = this.activeIDs;
    //integrate new ones
    ids.push.apply(this.activeIDs, r.created.map((id, i) => new CmdIDNode(id, node, i)));

    //delete old ones and update references
    if (r.removed.length > 0) {
      r.removed.forEach(function(rem) {
        var i = C.indexOf(ids, (active) => active.id == rem);
        var elem = ids[i];
        elem.usedBy.forEach((usedBy) =>  {
          elem.createdBy.references
        });
        ids.splice(i, 1);
      })
    }
  }
}
