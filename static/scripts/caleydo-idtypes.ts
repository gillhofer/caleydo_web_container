/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./caleydo');
import events = require('./caleydo-events');
'use strict';

var cache = undefined;

export class IDType extends events.EventHandler {

}

function load() {
  if(cache) {
    return C.resolved(cache);
  }
  return C.getJSON('data/idtypes.json').then(function(c) {
    cache = c;
    return c;
  });
}

export function resolve(name: string) : IDType {
 return null; //name; //FIXME cache and resolve
}
export function list() {
  return load();
}
export function register(name : string, idtype : IDType) {
  if (cache.hasOwnProperty(name)) {
    return cache[name];
  }
  cache[name] = idtype;
  return idtype;
}
