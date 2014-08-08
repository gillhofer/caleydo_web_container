/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../scripts/caleydo-range','../scripts/caleydo-iterator'], function (range,Iterator) {
  'use strict';

  describe('caleydo-range', function () {
    it('simple range', function() {
      var r = range.all();
      expect(r).have.property('isAll',true);
      expect(r).have.property('dims').eql([]);
    });

    it('toString', function() {
      expect(range.all().toString()).to.be.equal('');
      expect(range.from(10).toString()).to.be.equal('10:-1');
      expect(range.from(10).step(2).toString()).to.be.equal('10:-1:2');
      expect(range.list([1,2,3]).toString()).to.be.equal('(1,2,3)');

      expect(range.from(10,3).toString()).to.be.equal('10:-1,3:-1');
      expect(range.from(10,undefined,3).toString()).to.be.equal('10:-1,,3:-1');
    });

    it('parse', function() {
      var r;
      function check(dim, from,to,step) {
        expect(dim).respondTo('from').respondTo('to').respondTo('step');
        expect(dim).property('isAll',false);
        expect(dim).property('isList',false);
        expect(dim.from()).is.equal(from);
        expect(dim.to()).is.equal(to);
        expect(dim.step()).is.equal(step);
      }
      expect(range.parse('')).have.property('isAll',true);
      r = range.parse('10:-1');
      expect(r.dims).is.length(1);
      check(r.dim(0), 10, -1, 1);

      r = range.parse('10:-1:2');
      check(r.dim(0), 10, -1, 2);
      r = range.parse('(1,2,3)');
      expect(r.dims).is.length(1);
      expect(r.dim(0).isList).is.true;

      r = range.parse('10:-1,3:-1');
      expect(r.dims).is.length(2);
      check(r.dim(0), 10, -1, 1);
      check(r.dim(1), 3, -1, 1);

      r = range.parse('10:-1,,3:-1');
      expect(r.dims).is.length(3);
      check(r.dim(0), 10, -1, 1);
      expect(r.dim(1).isAll).is.true;
      check(r.dim(2), 3, -1, 1);
    });

    it('preMultiply', function() {
      var r;
      r = range.parse('0:10').preMultiply(range.all(), 10);
      check(d.dim(0), 0,10,1);
      r = range.parse('0:10').preMultiply(range.parse('0:5'), 10);
      check(d.dim(0), 0,5,1);
      r = range.parse('0:10').preMultiply(range.parse('0:10:2'), 10);
      check(d.dim(0), 0,10,2);
    })
  });
});