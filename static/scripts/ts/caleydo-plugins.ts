/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
import C = require('./caleydo');
import require_ = require('require');
import datatypes = require('./caleydo-datatype');
import plugindescs = require('caleydo-plugins-gen');

export interface IPluginDesc {
  type : string;
  name : string;
  autoload: boolean;
  module : string;
  factory: string;
  version: string;
  description: string;
  load() : C.IPromise<IPlugin>;
}

/**
 * basic plugin element
 */
export interface IPlugin {
  /**
   * underlying plugin description
   */
  desc: IPluginDesc;
  /**
   * link to the referenced method as described in the description
   */
  factory(): any;
}

/**
 * utility function to create a loading promise function which wraps requirejs
 * @param desc
 * @returns {function(): Promise}
 */
function loadHelper(desc:IPluginDesc):() => C.IPromise<IPlugin> {
  return () => C.promised<IPlugin>((resolver) => {
    require_([desc.module], (m) => {
      resolver({
        desc: desc,
        impl : m,
        factory : m[desc.factory]
      });
    });
  });
}

/**
 * parses the given descriptions and creates a full description out of it
 * @param descs
 * @returns {IPluginDesc[]}
 */
function parsePlugins(descs : any[]) {
  return descs.map((desc) => {
    //provide some default values
    desc = C.mixin({
      'module' : './'+desc.name+'/index',
      factory: 'create',
      autoload: false,
      description: '',
      version: '1.0'
    },desc);
    desc.load = loadHelper(<IPluginDesc>desc);
    return <IPluginDesc>desc;
  });
}

//map to descriptions
var plugins = parsePlugins(plugindescs.plugins);

/**
 * loads all auto load plugins and returns a promise for it
 * @returns {IPromise<IPlugin[]>}
 */
export function autoload():C.IPromise<IPlugin[]> {
  return C.promised((resolve) => {
    var auto = plugins.filter((desc) => desc.autoload).map((desc) => desc.module);
    if (auto.length === 0) {
      resolve([]);
    }
    //load all auto load plugins and return
    require_(auto, () => {
      //loaded
      resolve(C.argList(arguments));
    });
  });
}

/**
 * lists all plugins with an optional type filter
 * @param type
 * @returns {IPluginDesc[]}
 */
export function list(type = '') {
  if (type === '') {
    return plugins;
  }
  return plugins.filter((desc) => desc.type === type);
}

export function listVis(data:datatypes.IDataType):IPluginDesc[] {
  return plugins
    .filter(function(p : any) { return p.type === 'vis' && (!p.filter || p.filter(data)); });
}