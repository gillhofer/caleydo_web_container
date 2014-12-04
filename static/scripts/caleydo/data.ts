/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import C = require('./main');
import plugins = require('./plugin');
import datatypes = require('./datatype');
'use strict';

//find all datatype plugins
var available = plugins.list('datatype');
/**
 * load all descriptions and store them in a promise
 * @type {JQueryPromise<any>|JQueryGenericPromise<JQueryPromise<{}>>|JQueryGenericPromise<U>|JQueryPromise<JQueryPromise<{}>>|JQueryPromise<U>}
 */
var loader = C.getAPIJSON('/dataset').then(function (descs) {
  //load descriptions and create data out of them
  return C.all(descs.map((desc) => transformEntry(desc))).then((datas) => {
    var r = {};
    datas.forEach((data) => {
      r[data.desc.id] = data;
    });
    (<any>datas).byId = r;
    return datas;
  });
});

/**
 * create an object out of a description
 * @param desc
 * @returns {*}
 */
function transformEntry(desc) {
  if (desc === undefined) {
    return desc;
  }
  //find matching type
  var plugin = available.filter((p) => p.name === desc.type);
  //no type there create a dummy one
  if (plugin.length === 0) {
    return new datatypes.DataTypeBase(desc);
  }
  //take the first matching one
  return plugin[0].load().then((p) => {
    return p.factory(desc);
  });
}

/**
 * returns a promise for getting a map of all available data
 * @returns {JQueryPromise<any>}
 */
export function list() {
  return loader;
}
/**
 * returns a promise for getting a specific dataset
 * @param name
 * @returns {JQueryGenericPromise<datatypes.IDatatType>}
 */
export function get(name : string) : C.IPromise<datatypes.IDataType>;
export function get(persisted: any) : C.IPromise<datatypes.IDataType>;
export function get(persisted: any) : C.IPromise<datatypes.IDataType> {
  if (typeof persisted === 'string' || typeof persisted === 'number') {
    return this.list().then(function (data) {
      return data.byId[persisted];
    });
  }
  //resolve parent and then resolve it using restore item
  if (persisted.root) {
    return get(persisted.root).then((parent) => {
      return parent ? parent.restore(persisted) : null;
    })
  } else {
    //can't restore non root and non data id
    return C.resolved(null);
  }
}
