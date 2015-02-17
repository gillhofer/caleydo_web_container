/**
 * Created by sam on 10.02.2015.
 */

import multiform = require('../caleydo/multiform')
import provenance = require('./main');
import vis = require('../caleydo/vis');
import C = require('../caleydo/main');

function transform(inputs:provenance.IObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:vis.IVisInstance = inputs[0].v,
    transform = parameter.transform,
    bak = parameter.old || v.transform();
  v.transform(transform.scale, transform.rotate);
  return {
    inverse: createTransform(inputs[0], bak, transform)
  };
}
export function createTransform(v:provenance.IObjectRef<vis.IVisInstance>, t:vis.ITransform, old:vis.ITransform = null) {
  return {
    meta: provenance.meta('transform ' + v.toString(), provenance.cat.visual),
    id: 'transform',
    f: transform,
    inputs: [v],
    parameter: {
      transform: t,
      old: old
    }
  };
}

function changeVis(inputs:provenance.IObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:multiform.IMultiForm = inputs[0].v,
    to:string = parameter.to,
    from = parameter.from || v.act.id;
  v.switchTo(to);
  return {
    inverse: createChangeVis(inputs[0], from, to)
  };
}
export function createChangeVis(v:provenance.IObjectRef<multiform.IMultiForm>, to:string, from:string = null) {
  return {
    meta: provenance.meta('transform ' + v.toString(), provenance.cat.visual),
    id: 'changeVis',
    f: changeVis,
    inputs: [v],
    parameter: {
      to: to,
      from: from
    }
  };
}

function setOption(inputs:provenance.IObjectRef<any>[], parameter:any):provenance.ICmdResult {
  var v:vis.IVisInstance = inputs[0].v,
    name = parameter.name,
    value = parameter.value,
    bak = parameter.old || v.option(name);
  v.option(name, value);
  return {
    inverse: createSetOption(inputs[0], name, bak, value)
  };
}

export function createSetOption(v:provenance.IObjectRef<vis.IVisInstance>, name:string, value:any, old:any = null) {
  return {
    meta: provenance.meta('set option "' + name + +'" of "' + v.toString() + ' to "' + value + '"', provenance.cat.visual),
    id: 'setOption',
    f: setOption,
    inputs: [v],
    parameter: {
      name: name,
      value: value,
      old: old
    }
  };
}

export function attach(graph:provenance.ProvenanceGraph, v:provenance.IObjectRef<vis.IVisInstance>) {
  var m = v.v;
  if (C.isFunction((<any>m).switchTo)) {
    m.on('changed', (event, new_, old) => {
      graph.push(createChangeVis(<provenance.IObjectRef<multiform.IMultiForm>>v, new_.id, old ? old.id : null));
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
      return transform;
    case 'changeVis' :
      return changeVis;
    case 'setOption' :
      return setOption;
  }
  return null;
}

