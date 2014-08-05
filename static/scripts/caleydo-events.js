/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['jquery'], function ($) {
  'use strict';
  function EventHandler() {
    var $obj = $({});

    /**
     * register a global event handler
     * @param events
     * @param handler
     */
    this.on = function (events, handler) {
      $obj.on(events, handler);
      return this;
    };
    /**
     * unregister a global event handler
     * @param events
     * @param handler
     */
    this.off = function (events, handler) {
      $obj.off(events, handler);
      return this;
    };
    /**
     * fires an event
     * @param event
     * @param extraArguments
     */
    this.fire = function (event, extraArguments) {
      $obj.trigger(event, extraArguments);
      return this;
    }
  }
  var ex = new EventHandler();
  ex.EventHandler = EventHandler;
  return ex;
});