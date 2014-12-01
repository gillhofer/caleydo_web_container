/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('./main');
import plugins = require('./plugin');

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
  restore(persisted: any) : IPersistable;
}

/**
 * a basic command interface
 */
export interface IPersistableCommand {
  /**
   * id needed for restoring via factory
   */
  id : string;

  /**
   * persists this cmd to a JSON compatible format
   */
  persist(): any;

  /**
   * runs this cmd
   */
  execute() : void;

  /**
   * reverts this cmd
   */
  revert() : void;
}

/**
 * command wrapper in a linked list style
 */
class Command {
  public next: Command = null;
  constructor(private cmd : IPersistableCommand, public prev : Command, private id : string = C.uniqueString('cmd')) {
    if (prev) {
      prev.next = this;
    }
  }
  revert() {
    this.cmd.revert();
  }

  execute()  {
    this.cmd.execute();
  }

  persist(container : any) {
    //save the graph within a list with links
    container[this.id] = {
      id: this.cmd.id,
      content: this.cmd.persist(),
      prev : this.prev ? this.prev.id : null,
      next : this.next ? this.next.id : null
    };
    if (this.prev && !container.hasOwnProperty(this.prev.id)) {
      this.prev.persist(container);
    }
    if (this.next && !container.hasOwnProperty(this.next.id)) {
      this.next.persist(container);
    }
    return this.id;
  }

  static restore(start : string, container : any, toCmd : (id: string, content: any) => C.IPromise<IPersistableCommand>) : C.IPromise<Command> {
    if (!start) {
      return C.resolved(null);
    }
    var p = container[start];
    if (p instanceof Command) {
      return C.resolved(p);
    }
    //1. load the cmd
    return toCmd(p.id, p.content).then((cmd) => {
      //convert to cmd object
      //persist -> needed to avoid loops
      container[start] = new Command(cmd, null, start);
      //restore neighbors
      return C.all([Command.restore(p.prev, container, toCmd), Command.restore(p.next, container, toCmd)]);
    }).then((neighbors) => {
      //save neighbors
      var r = container[start];
      r.prev = neighbors[0];
      r.next = neighbors[1];
      return r;
    });
  }
}

/**
 * queue of commands with undo functionality
 */
export class CommandQueue implements IPersistable {
  private act: Command = null;

  pushAndExecute(cmd : IPersistableCommand) {
    cmd.execute();
    this.act = new Command(cmd, this.act);
  }

  revert() {
    if (this.act) {
      this.act.revert();
      this.act = this.act.prev;
      return true;
    }
    return false;
  }

  reexecute() {
    if (this.act.next) {
      this.act = this.act.next;
      this.act.execute();
      return true;
    }
    return false;
  }

  persist(): any {
    var r : any = {};
    if (this.act) {
      r._act = this.act.persist(r);
    }
    return r;
  }
  /**
   * restores from stored persisted state
   * @param persisted a result of a previous persist call
   * @return the restored view or null if it could be in place restored
   */
  restore(persisted: any) : IPersistable {
    if (!persisted.hasOwnProperty('_act')) {
      return; //nothing to restore
    }
    var cmdFactories = plugins.list('cmdFactory');
    function toCmd(id: string, content: any) : C.IPromise<IPersistableCommand> {
      var i;
      for(i = 0; i < cmdFactories.length; ++i) {
        var m = cmdFactories[i].matches;
        if (id.match(m)) {
          return cmdFactories[i].load().then((plugin) => {
            return plugin.factory(id, content);
          })
        }
      }
      return null;
    }

    //restore and work on simple copy
    Command.restore(persisted._act, C.mixin({}, persisted), toCmd).then((act) => {
      this.act = act;
    });

    return this;
  }
}

