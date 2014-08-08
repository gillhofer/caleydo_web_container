/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
import C = require('./caleydo');
import require_ = require('require');
import datatypes = require('./caleydo-datatype');
import plugindescs = require('caleydo-plugins-gen');

/**
 * basic interface of a plugin
 */
export interface IPluginDesc {
  /**
   * type of plugin, a name by convention for identifying different plugin types
   */
  type : string;
  /**
   * name of the plugin, should be unique within a type
   */
  name : string;
  /**
   * name of the require.js module to load
   * @default ./<name>/index
   */
  module : string;
  /**
   * name of the method, which is the entry point of this plugin
   * @default create
   */
  factory: string;
  /**
   * version of this plugin
   * @default 1.0
   */
  version: string;
  /**
   * optional description of this plugin   *
   */
  description: string;

  /**
   * function for loading this plugin
   * @returns a promise for the loaded plugin
   */
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
 * utility function to create a loading promise function which wraps require.js
 * @param desc
 * @returns {function(): Promise}
 */
function loadHelper(desc:IPluginDesc):() => C.IPromise<IPlugin> {
  return () => C.promised<IPlugin>((resolver) => {
    //require module
    require_([desc.module], (m) => {
      //create a plugin entry
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
 * lists all plugins with an optional type filter
 * @param type plugin type
 * @returns {IPluginDesc[]}
 */
export function list(type = '') {
  if (type === '') {
    return plugins;
  }
  return plugins.filter((desc) => desc.type === type);
}

/**
 * loads all given plugins at once and returns a promise
 * @param plugins
 * @returns {Promise}
 */
export function load(plugins: IPluginDesc[]) :C.IPromise<IPlugin[]> {
  return C.promised((resolve) => {
    require_(plugins.map((desc) => desc.module), (loaded) => {
      //loaded
      resolve(loaded);
    });
  });
}

/**
 * list a vis plugins and check in addition whether the match the given data type
 * @param data the data type to visualize
 * @returns {IPluginDesc[]}
 */
export function listVis(data:datatypes.IDataType):IPluginDesc[] {
  return list('vis').filter((desc: any) => (!desc.filter || desc.filter(data)));
}