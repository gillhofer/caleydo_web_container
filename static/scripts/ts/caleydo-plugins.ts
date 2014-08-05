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
  version: string;
  description: string;
  load() : C.IPromise<IPlugin>;
}
export interface IVisualizationPluginDesc extends IPluginDesc {
  filter : (data:datatypes.IDataType) => boolean;
  size : (dim:number[]) => number[];
}
export interface IPlugin {
  desc: IPluginDesc;
}
export interface IVisualizationPlugin extends IPlugin {
  desc: IVisualizationPluginDesc;
  create(data:datatypes.IDataType, parent:HTMLElement) : IVisualization;
}
export interface IVisualization {

}

export function loadHelper(desc:IPluginDesc):() => C.IPromise<IPlugin> {
  return () => C.promised<IPlugin>((resolver) => {
    require_([desc.module], (m:IPlugin) => {
      if (!m.desc) {
        m.desc = desc;
      }
      resolver(m);
    });
  });
}

function parsePlugins(descs : any[]) {
  return descs.map((desc) => {
    var m:string = desc.module || desc.name;
    var r:any = {
      name: <string>(desc.name),
      type: <string>(desc.type),
      module: m,
      autoload: <boolean>(desc.autoload || false),
      description: <string>(desc.description || ''),
      version: <string>(desc.version || '1.0'),
      load: null
    };
    r.load = loadHelper(<IPluginDesc>r);
    switch (desc.type) {
      case 'vis':
      {
        r.size = desc.size || ((dim:number) => NaN);
        r.filter = desc.filter || C.constant(true);
      }
    }
    return <IPluginDesc>r;
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

export function listVis(data:datatypes.IDataType):IVisualizationPluginDesc[] {
  return plugins
    .filter(function(p : any) { return p.type === 'vis' && p.filter && p.filter(data); })
    .map(function(p) { return <IVisualizationPluginDesc>(<any>p); });
}