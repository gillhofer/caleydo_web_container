/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
import C = require('./main');
import plugins = require('./plugin');
import datatypes = require('./datatype');
import ranges = require('./range');
import provenance = require('./provenance');
import events = require('./event');


export interface ITransform {
  scale: number[];
  rotate: number;
}

export interface IVisMetaData {
  size : {
    (dim: number[]) : number[];
    scale: string; //'free' | 'aspect' | 'width-only' | 'height-only'
    isDimensionDependent : boolean;
    scaled(dim: number[], tranform: ITransform);
  }
}

export interface IVisPluginDesc extends plugins.IPluginDesc, IVisMetaData {
  filter(data: datatypes.IDataType) : boolean;
  iconify(node: HTMLElement);
}

export interface IVisInstance extends provenance.IPersistable, events.IEventHandler {
  id: string;
  node: Element;
  data: datatypes.IDataType;
  locate(...range: ranges.Range[]): C.IPromise<any>;

  transform(): ITransform;
  transform(scale: number[], rotate: number) : ITransform;

  option(name: string) : any;
  option(name: string, value: any) : any;

  destroy();
}

export class AVisInstance extends events.EventHandler {
  id = C.uniqueString('vis');

  option(name: string, value?: any) {
    return null;
  }

  persist() {
    return null;
  }

  locate(...range:ranges.Range[]) {
    if (range.length === 1) {
      return this.locateImpl(range[0]);
    }
    return C.all(range.map(this.locateImpl, this));
  }

  locateImpl(range: ranges.Range) {
    return C.resolved(null);
  }

  restore(persisted: any) {
    return null;
  }

  destroy() {

  }
}

function extrapolateFilter(r: any) {
  var v = r.filter;
  if (typeof v === 'undefined') {
    r.filter = C.constantTrue;
  } else if (typeof v == 'string') {
    r.filter = (data) => data && data.desc.type === v;
  } else if (C.isArray(v) && v.length == 2 && typeof v[0] === 'string' && typeof v[1] === 'string') {
    r.filter = (data) => data && data.desc.type === v[0] && (data.desc.value && data.desc.value.type === v[1]);
  }
}

function extrapolateIconify(r: any) {
  if (C.isFunction(r.iconify)) {
    return;
  }
  r.iconify = function iconfiy(node: HTMLElement) {
    node.title = this.name;
    if(this.iconcss) {
      node.classList.add('fa');
      node.classList.add(this.iconcss);
    } else if (this.icon) {
      node.classList.add('fa');
      node.classList.add('fa-fw');
      node.style['background-image'] = 'url(' + this.baseUrl + '/' + this.icon + ')';
      node.innerHTML = '&nbsp';
    } else {
      node.innerText = this.name.substr(0, 1).toUpperCase();
    }
  };
}
function extrapolateSize(r : any) {
  if (C.isFunction(r.size) && typeof r.size.isDimensionDependent === 'boolean') {
    return;
  }
  var s = r.size;
  function toFunction(s) {
    if (Array.isArray(s)) {
      r.size = () => s;
      r.size.isDimensionDependent = false;
      r.size.scale = 'free';
    } else if (typeof s === 'number') {
      r.size = () => [s,s];
      r.size.isDimensionDependent = false;
      r.size.scale = 'aspect';
    } else if (C.isFunction(r.size)) {
      r.size.isDimensionDependent = true; //why else use a function?
      r.size.scale = 'free';
    } else {
      return false;
    }
    var t = r.size;
    r.size.scaled = (dim: number[], transform: ITransform) => {
      var rr = t(dim);
        return [transform.scale[0] * rr[0], transform.scale[1] * rr[1]];
    };
    return true;
  }
  if (toFunction(r.size)) {

  } else if (C.isPlainObject(s)) {
    toFunction(s.size);
    if (typeof s.isDimensionDependent === 'boolean') {
      r.size.isDimensionDependent = s.isDimensionDependent;
    }
    if (typeof s.scale === 'string') {
      r.size.scale = s.scale;
    }
    if (C.isFunction(s.scaled)) {
      r.size.scaled = s.scaled;
    }
  }
}

function toVisPlugin(plugin : plugins.IPluginDesc) : IVisPluginDesc {
  var r : any = plugin;
  extrapolateFilter(r);
  extrapolateIconify(r);
  extrapolateSize(r);
  return r;
}

/**
 * list a vis plugins and check in addition whether the match the given data type
 * @param data the data type to visualize
 * @returns {IPluginDesc[]}
 */
export function list(data:datatypes.IDataType): IVisPluginDesc[] {
  //filter additionally with the filter attribute, which can be a function or the expected data type
  return plugins.list('vis').map(toVisPlugin).filter((desc) => desc.filter(data));
}
