/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../scripts/caleydo'], function (C) {
  'use strict';

  describe('Caleydo', function () {
    it('version', function () {
      expect(C.version).to.equal('0.0.1-alpha');
    });

    it('promised', function () {

    });

    it('resolved', function () {

    });

    it('mixin', function () {

    });

    it('getJSON', function () {

    });

    it('isFunction', function () {
      expect(C.isFunction([])).to.be.false;
      expect(C.isFunction(3)).to.be.false;
      expect(C.isFunction([1,2])).to.be.false;
      expect(C.isFunction({})).to.be.false;
      expect(C.isFunction({ a: 3})).to.be.false;
      expect(C.isFunction(function() {})).to.be.true;
      function B() {

      }
      expect(C.isFunction(new B())).to.be.false;
    });

    it('isArray', function () {
      expect(C.isArray([])).to.be.true;
      expect(C.isArray(3)).to.be.false;
      expect(C.isArray([1,2])).to.be.true;
      expect(C.isArray({})).to.be.false;
      expect(C.isArray({ a: 3})).to.be.false;
      expect(C.isArray(function() {})).to.be.false;
      function B() {

      }
      expect(C.isArray(new B())).to.be.false;
    });

    it('isEmptyObject', function () {
      //see http://api.jquery.com/jQuery.isEmptyObject/ others than object doesn't work
      //expect(C.isEmptyObject([])).to.be.false;
      //expect(C.isEmptyObject(3)).to.be.false;
      //expect(C.isEmptyObject([1,2])).to.be.false;
      expect(C.isEmptyObject({})).to.be.true;
      expect(C.isEmptyObject({ a: 3})).to.be.false;
      //expect(C.isEmptyObject(function() {})).to.be.false;
      //function B() {
      //
      //}
      //expect(C.isEmptyObject(new B())).to.be.true;
    });

    it('isPlainObject', function () {
      expect(C.isPlainObject([])).to.be.false;
      expect(C.isPlainObject(3)).to.be.false;
      expect(C.isPlainObject([1,2])).to.be.false;
      expect(C.isPlainObject({})).to.be.true;
      expect(C.isPlainObject({ a: 3})).to.be.true;
      expect(C.isPlainObject(function() {})).to.be.false;
      function B() {

      }
      expect(C.isPlainObject(new B())).to.be.false;
    });

    it('identity', function () {
      expect(C.identity(2)).to.be.equal(2);
      expect(C.identity('A')).to.be.equal('A');
      expect(C.identity()).to.be.undefined;
      expect(C.identity(null)).to.be.null;
    });

    it('noop', function () {
      expect(C.noop(2)).to.be.undefined;
    });

    it('constant', function () {
      expect(C.constant(2)).to.be.a('function');
    });

    it('callable', function () {

    });
  });
});
