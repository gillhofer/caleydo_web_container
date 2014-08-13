/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../scripts/caleydo-range', '../scripts/caleydo-iterator'], function (range, Iterator) {
  'use strict';

  describe('caleydo-range', function () {
    it('simple range', function () {
      var r = range.all();
      expect(r).have.property('isAll', true);
      expect(r).have.property('dims').eql([]);
    });

    it('toString', function () {
      expect(range.all().toString()).to.be.equal('');
      expect(range.list(10).toString()).to.be.equal('10');
      expect(range.range(10).toString()).to.be.equal('10:-1');
      expect(range.list(1,2,3).toString()).to.be.equal('1:4');

      //expect(range.from(10, 3).toString()).to.be.equal('10:-1,3:-1');
      //expect(range.from(10, undefined, 3).toString()).to.be.equal('10:-1,,3:-1');
    });

    function check(dim, code) {
      expect(dim).property('isAll', false);
      expect(dim.toString()).is.equal(code);
    }

    it('parse', function () {
      var r;

      expect(range.parse('')).have.property('isAll', true);
      r = range.parse('10:-1');
      expect(r.dims).is.length(1);
      check(r.dim(0), '10:-1');

      r = range.parse('10:-1:-1');
      check(r.dim(0), '10:-1:-1');
      r = range.parse('(1,2,3)');
      expect(r.dims).is.length(1);
      expect(r.dim(0).isList).is.true;

      r = range.parse('10:-1,3:-1');
      expect(r.dims).is.length(2);
      check(r.dim(0), '10:-1');
      check(r.dim(1), '3:-1');

      r = range.parse('10:-1,,3:-1');
      expect(r.dims).is.length(3);
      check(r.dim(0), '10:-1');
      expect(r.dim(1).isAll).is.true;
      check(r.dim(2), '3:-1');
    });

    it('preMultiply', function () {
      var r;
      r = range.parse('0:10').preMultiply(range.all(), 10);
      check(r.dim(0), '0:10');
      r = range.parse('0:10').preMultiply(range.parse('0:5'), 10);
      check(r.dim(0), '0:5');
      r = range.parse('2:10').preMultiply(range.parse('0:2'), 10);
      check(r.dim(0), '2:4');
    });

    it('from', function () {
      expect(range.list(0,1,2,3,4,5).toString()).is.equal('0:6');
      expect(range.list(0,1,2,3,6,7).toString()).is.equal('(0:4,6:8)');
    });
  });
});