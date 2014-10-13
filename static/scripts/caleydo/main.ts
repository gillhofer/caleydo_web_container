/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />
import $ = require('jquery');
import module_ = require('module');
var config = module_.config();
'use strict';

/**
 * version of the core
 */
export var version = '0.0.1-alpha';

export var server_url : string = config.apiUrl;

/**
 * wraps the given resolver function to be a promise
 * @param resolver
 * @param {function(resolve, reject)} resolver - the promise resolver
 * @returns {Promise} a promise object
 */
export function promised<T>(f) {
  var d = $.Deferred<T>();
  f((r) => {
    d.resolve(r);
  }, (r) => {
    d.reject(r);
  });
  return d.promise();
}
/**
 * wraps the given result as a promise
 * @param result - the result of the promise
 * @returns {Promise} a promise object
 */
export function resolved(result) {
  return $.Deferred().resolve(result).promise();
}

/**
 * when all given promises are done
 * @param deferreds the promises to wait for
 * @type {IPromise<Array<any>>}
 */
export function all(promises: any[]): IPromise<Array<any>> {
  return $.when.apply($,promises).then(() => argList(arguments));
}

export interface IPromise<T> extends JQueryPromise<T> {

}
/**
 * async JSON loading
 * @see {@link http://api.jquery.com/jQuery.getJSON/}
 */
export var getJSON = $.getJSON;
/**
 * integrate b into a and override all duplicates
 * @param {Object} a
 * @param {Object} b
 * @returns {Object} a with extended b
 */
export function mixin(a, b) {
  return $.extend(a, a, b);
}

//wrap function wrap jquery which may be overwritten replaced sometimes
/**
 * test the given object is a function
 */
export var isFunction = $.isFunction;
/**
 * test if the argument t is an array
 */
export var isArray = $.isArray;
/**
 * test if the argument is an empty object, works just for testing objects
 */
export var isEmptyObject = $.isEmptyObject;
/**
 * test if the argument is a plain object, no subclassing
 */
export var isPlainObject = $.isPlainObject;

export function isUndefined(obj : any) {
  return typeof obj === 'undefined';
}

/**
 * identity function
 */
export function identity(d:any) {
  return d;
}

/**
 * a dummy function, which does exactly nothing, i.e. used as default
 */
export function noop() {
}

/**
 * just returns the argument in any case
 * @param r - the value to return
 * @returns {*}
 */
export function constant(r) {
  if (typeof r === 'boolean' && r === true) {
    return constantTrue;
  }
  if (typeof r === 'boolean' && r === false) {
    return constantFalse;
  }
  return () => r;
}

/**
 * special constant function which returns always true, i.e., as a default for a filter function
 * @returns {boolean}
 */
export function constantTrue() {
  return true;
}

/**
 * special constant function which returns always false, i.e., as a default for a filter function
 * @returns {boolean}
 */
export function constantFalse() {
  return true;
}

/**
 * copies a plain object into a function and call a specific method onto direct call
 * @param obj - the
 * @param f
 */
export function callable(obj:any, f:string) {
  //assert this.isPlainObject(obj);
  function CallAbleFactory() {
    var that;

    function CallAble() {
      that[f].apply(that, argList(arguments));
    }

    that = CallAble;
    mixin(CallAble, obj);
    return CallAble;
  }

  return CallAbleFactory;
}

/**
 * converts the given arguments object into an array
 * @param args
 * @returns {*|Array}
 */
export function argList(args:IArguments) {
  if (arguments.length > 1) {
    return Array.prototype.slice.call(arguments);
  } else {
    return Array.prototype.slice.call(args);
  }
}

/**
 * array with indices of 0...n-1
 * @param n
 * @returns {any[]}
 */
function indexRange(n : number) {
  //http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, {length: n}).map(Number.call, Number);
}

/**
 * returns the sorted indices of this array, when sorting by the given function
 * @param arr
 * @param compareFn
 * @param thisArg
 */
export function argSort<T>(arr: T[], compareFn?: (a: T, b: T) => number, thisArg?: any): number[] {
  var indices = indexRange(arr.length);
  return indices.sort((a, b) => {
    return compareFn.call(thisArg, arr[a], arr[b]);
  })
}

/**
 * returns the indices, which remain when filtering the given array
 * @param arr
 * @param callbackfn
 * @param thisArg
 */
export function argFilter<T>(arr: T[], callbackfn: (value: T, index: number) => boolean, thisArg?: any): number[] {
  var indices = indexRange(arr.length);
  return indices.filter((value, index) => {
    return callbackfn.call(thisArg, arr[value], index);
  })
}

/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(s: Element[], callback: () => void, thisArg?  : any);
/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(node: Element, callback: () => void, thisArg?  : any);
/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(node: any, callback: () => void, thisArg? : any) {
  var arr : any[], body = document.getElementsByTagName('body')[0];
  if (!isArray(node)) {
    arr = [node];
  } else {
    arr = <any[]>node;
  }
  arr.forEach((n) => {
    function l(evt) {
      //since this event bubbles check if it the right node
      var act = n;
      while (act) { //check if node or its parent are removed
        if (evt.target === act) {
          node = null;
          n.removeEventListener('DOMNodeRemoved', l);
          body.removeEventListener('DOMNodeRemoved', l);
          callback.call(thisArg, n);
          return;
        }
        n = n.parentNode;
      }
    }
    n.addEventListener('DOMNodeRemoved', l);
    body.addEventListener('DOMNodeRemoved', l);
  });
}
