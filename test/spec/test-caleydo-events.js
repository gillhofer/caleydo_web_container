/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../scripts/ts/caleydo-events'], function (events) {
  'use strict';

  describe('caleydo-events', function () {
    it('global events', function() {
      var have = false;
      var f = function (event, v) {
        if (have) {
          expect(null).to.be.not.null;
        } else {
          expect(v).to.be.equal(3);
          have = true;
        }
      };
      events.on('test', f);
      events.fire('test',3);
      events.off('test', f);
      events.fire('test',4);
    });
    it('event object', function() {
      var r = new events.EventHandler();
      expect(r).to.respondTo('on');
      expect(r).to.respondTo('off')
      expect(r).to.respondTo('fire');
    });
    it('multiple handlers', function() {
      var r = new events.EventHandler();
      var c = 0;
      r.on('test', function () {
        c++;
      });
      r.on('test', function () {
        c++;
      });
      r.fire('test');
      expect(c).to.be.equal(2);
    });
    it('stopImmediatePropagation()', function() {
      var r = new events.EventHandler();
      r.on('test', function (event) {
        event.stopImmediatePropagation();
      });
      r.on('test', function () {
        //should not be called
        expect(null).to.be.not.null;
      });
      r.fire('test');
    });
  });
});