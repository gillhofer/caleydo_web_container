/**
 * Created by Samuel Gratzl on 17.07.2014.
 */
/*global define */
define(['jquery'], function ($) {
  function createEventClass() {
    var $obj = $({});
    var r = function EventListener() {

    }
    /**
     * register a global event handler
     * @param events
     * @param handler
     */
    r.on = function (events, handler) {
      $obj.on(events, handler);
    };
    /**
     * unregister a global event handler
     * @param events
     * @param handler
     */
    r.off = function (events, handler) {
      $obj.off(events, handler);
    };
    /**
     * fires an event
     * @param event
     * @param extraArguments
     */
    r.fire = function (event, extraArguments) {
      $obj.trigger.apply($obj, event, extraArguments);
    }
    return r;
  }

  var ex = createEventClass();
  ex.createEventClass = createEventClass();
  return ex;
});