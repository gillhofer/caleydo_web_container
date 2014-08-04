/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../../tsd.d.ts" />
import $ = require('jquery');
'use strict';

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

export var global = new EventHandler();