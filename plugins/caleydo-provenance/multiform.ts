/**
 * Created by sam on 10.02.2015.
 */

import multiform = require('../caleydo/multiform')
import provenance = require('./main');
import vis = require('../caleydo/vis');
import session = require('../caleydo/session');
import C = require('../caleydo/main');

function transform(inputs:provenance.ObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:vis.IVisInstance = inputs[0].value,
    transform = parameter.transform,
    bak = parameter.old || v.transform();
  v.transform(transform.scale, transform.rotate);
  return {
    created: [],
    removed: [],
    inverse: createTransform(inputs[0], bak, transform)
  };
}
var transformCmd:provenance.ICmdFunction = <provenance.ICmdFunction>transform;
transformCmd.id = 'transform';

export function createTransform(v:provenance.ObjectRef<vis.IVisInstance>, transform:vis.ITransform, old:vis.ITransform = null) {
  return new provenance.Cmd(provenance.meta('transform ' + v.toString(), provenance.CmdCategory.visual), transformCmd, [v], {
    transform: transform,
    old: old
  });
}

function changeVis(inputs:provenance.ObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:multiform.IMultiForm = inputs[0].value,
    to:string = parameter.to,
    from = parameter.from || v.act.id;
  v.switchTo(to);
  return {
    created: [],
    removed: [],
    inverse: createChangeVis(inputs[0], from, to)
  };
}
var changeVisCmd:provenance.ICmdFunction = <provenance.ICmdFunction>changeVis;
changeVisCmd.id = 'changeVis';

export function createChangeVis(v:provenance.ObjectRef<multiform.IMultiForm>, to:string, from:string = null) {
  return new provenance.Cmd(provenance.meta('transform ' + v.toString(), provenance.CmdCategory.visual), changeVisCmd, [v], {
    to: to,
    from: from
  });
}

function setOption(inputs:provenance.ObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:vis.IVisInstance = inputs[0].value,
    name = parameter.name,
    value = parameter.value,
    bak = parameter.old || v.option(name);
  v.option(name, value);
  return {
    created: [],
    removed: [],
    inverse: createSetOption(inputs[0], name, bak, value)
  };
}
var setOptionCmd:provenance.ICmdFunction = <provenance.ICmdFunction>setOption;
setOptionCmd.id = 'setOption';

export function createSetOption(v:provenance.ObjectRef<vis.IVisInstance>, name:string, value:any, old:any = null) {
  return new provenance.Cmd(provenance.meta('set option "' + name + +'" of "' + v.toString() + ' to "' + value + '"', provenance.CmdCategory.visual), setOptionCmd, [v], {
    name: name,
    value: value,
    old: old
  });
}

export function attach(graph:provenance.ProvenanceGraph, v:provenance.ObjectRef<vis.IVisInstance>) {
  var m = v.value;
  if (C.isFunction((<any>m).switchTo)) {
    m.on('changed', (event, new_, old) => {
      graph.push(createChangeVis(<provenance.ObjectRef<multiform.IMultiForm>>v, new_.id, old ? old.id : null));
    });
  }
  m.on('transform', (event, new_, old) => {
    graph.push(createTransform(v, new_, old));
  });
  m.on('option', (event, name, new_, old) => {
    graph.push(createSetOption(v, name, new_, old));
  });
}

export function createCmd(id:string) {
  switch (id) {
    case 'transform':
      return transformCmd;
    case 'changeVis' :
      return changeVisCmd;
    case 'setOption' :
      return setOptionCmd;
  }
  return null;
}

