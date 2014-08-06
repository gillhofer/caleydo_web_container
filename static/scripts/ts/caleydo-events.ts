/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />
import $ = require('jquery');
'use strict';

/**
 * EventHandler base class, in the backend JQuery is used
 */
export class EventHandler {
  private $obj = $({});

  /**
   * register a global event handler
   * @param events
   * @param handler
   */
  on(events, handler) {
    this.$obj.on(events, handler);
    return this;
  }

  /**
   * unregister a global event handler
   * @param events
   * @param handler
   */
  off(events, handler) {
    this.$obj.off(events, handler);
    return this;
  }

  /**
   * fires an event
   * @param event
   * @param extraArguments
   */
  fire(event, extraArguments) {
    this.$obj.trigger(event, extraArguments);
    return this;
  }
}

var global = new EventHandler();

/**
 * register a global event handler
 * @param events
 * @param handler
 */
export function on(events, handler) {
  return global.on(events, handler);
}

/**
 * unregister a global event handler
 * @param events
 * @param handler
 */
export function off(events, handler) {
  return global.off(events, handler);
}

/**
 * fires an event
 * @param event
 * @param extraArguments
 */
export function fire(event, extraArguments) {
  return global.fire(event, extraArguments);
}