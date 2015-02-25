/**
 * Created by sam on 25.02.2015.
 */

import layouts = require('./main');
import plugins = require('../caleydo/plugin');
import datatypes = require('../caleydo/datatype');
import idtypes = require('../caleydo/idtype');
import events = require('../caleydo/event');
import geom = require('../caleydo/geom');


export interface IViewDesc extends plugins.IPluginDesc {
  type: string; //support, main
  location: string; //left, top, bottom, right, center
}

export interface IView extends layouts.ILayoutElem, events.IEventHandler {
  desc : IViewDesc;

  data : datatypes.IDataType[];
  idtypes : idtypes.IDType[];

}

export class AView extends events.EventHandler implements IView {
  private _layoutOptions : any = {};

  constructor(public desc: IViewDesc) {
    super();
  }

  get data() {
    return [];
  }

  get idtypes() {
    return  [];
  }

  setBounds(x:number, y:number, w:number, h:number) {
    //implement
  }

  getBounds(): geom.Rect {
    return geom.rect(0,0,0,0);
  }

  setLayoutOption(name: string, value: any) {
    this._layoutOptions[name] = value;
  }

  layoutOption<T>(name: string, default_: T = null) : T {
    if (this._layoutOptions.hasOwnProperty(name)) {
      return this._layoutOptions[name];
    }
    return default_;
  }
}

function convertDesc(desc: plugins.IPluginDesc) : IViewDesc {
  var d = <any>desc;
  d.type = d.type || 'main';
  d.location = d.location || 'center';
  return d;
}

export function list() {
  return plugins.list('view').map(convertDesc);
}
