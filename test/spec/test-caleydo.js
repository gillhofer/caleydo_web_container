/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../scripts/caleydo'], function (C) {
  'use strict';

  describe('caleydo', function () {
    it('version', function () {
      expect(C.version).to.equal('0.0.1-alpha');
    });

    it('promised', function (done) {
      expect(C.promised(function() {})).to.respondTo('then');

      C.promised(function(resolved) {
        resolved('a');
      }).then(function(param) {
        expect(param).to.be.equal('a');
        done();
      });
      C.promised(function(resolved, reject) {
        reject('a');
      }).then(function(param) {
        expect(null).to.be.not.null;
        done();
      }, function(error) {
        expect(error).to.be.equal('a');
        done();
      });
    });

    it('resolved', function (done) {
      expect(C.resolved('a')).to.respondTo('then');

      C.resolved('a').then(function(param) {
        expect(param).to.be.equal('a');
        done();
      },function() {
        expect(null).to.be.not.null;
        done();
      });
    });

    it('mixin', function () {
      expect(C.mixin({},{})).to.be.empty;
      expect(C.mixin({a:3},{})).to.deep.equal({ a: 3});
      expect(C.mixin({},{a:3})).to.deep.equal({ a: 3});
      expect(C.mixin({a:4},{a:3})).to.deep.equal({ a: 3});
      expect(C.mixin({a:4},{b:3})).to.deep.equal({ a: 4, b:3});
    });

    it('getJSON', function (done) {
      C.getJSON('testdata/simple.json').then(function(data) {
        expect(data).to.be.not.empty;
        expect(data).have.property('a',3);
        expect(data).have.property('b');
        expect(data.b).is.eql([1,2,3]);
        done();
      });
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
      expect(C.constant(2)()).to.be.equal(2);
      expect(C.constant(2)(33)).to.be.equal(2);
    });

    it('callable', function () {
      var r = {
        a: 3,
        r : function(b) {
          return this.a + b;
        }
      };
      expect(C.callable(r, 'r')).to.be.a('function');
      //expect(C.callable(r, 'r')).to.have.property('a');
      //expect(C.callable(r, 'r')).to.respondTo('r');
      //expect(C.callable(r, 'r').r(4)).to.be.equal(7);
      //expect(C.callable(r, 'r')(4)).to.be.equal(7);

    });

    it('argList', function () {
      expect(function() {
        return C.argList(arguments);
      }(1,2,3)).to.be.eql([1,2,3]);
    });
  });
});
