/**
 * Created by Samuel Gratzl on 21.07.2014.
 */
/* global define, describe, it, assert, should, expect */

define(['../../scripts/caleydo/iterator'], function (Iterator) {
  'use strict';

  function testIt(it) {
    expect(it).have.respondTo('hasNext');
    expect(it).have.respondTo('next');
    expect(it).have.respondTo('asList');
    expect(it).have.property('isIncreasing');
    expect(it).have.property('isDecreasing');
    expect(it).have.property('byOne');
    expect(it).have.property('byMinusOne');
  }

  describe('caleydo-iterator', function () {
    it('simple range', function () {
      var it = Iterator.range(0, 5, 1);
      expect(it).have.property('from', 0);
      expect(it).have.property('to', 5);
      expect(it).have.property('step', 1);
      expect(it).have.property('isIncreasing', true);
      expect(it).have.property('isDecreasing', false);
      expect(it).have.property('byOne', true);
      expect(it).have.property('byMinusOne', false);
      expect(it.asList()).is.eql([0, 1, 2, 3, 4]);
    });
    it('list iterator', function () {
      var it = Iterator.forList([1, 2, 3]);
      expect(it).have.property('isIncreasing', false);
      expect(it).have.property('isDecreasing', false);
      expect(it).have.property('byOne', false);
      expect(it).have.property('byMinusOne', false);
      expect(it.asList()).is.eql([1, 2, 3]);
    });
    it('next', function () {
      var it = Iterator.range(0, 5, 1);
      expect(it.hasNext()).is.true;
      expect(it.next()).is.equal(0);
      expect(it.hasNext()).is.true;
      expect(it.next()).is.equal(1);
      expect(it.hasNext()).is.true;
      expect(it.next()).is.equal(2);
      expect(it.hasNext()).is.true;
      expect(it.next()).is.equal(3);
      expect(it.hasNext()).is.true;
      expect(it.next()).is.equal(4);
      expect(it.hasNext()).is.false;
      expect(function () {
        it.next()
      }).throw(RangeError);
      expect(it.hasNext()).is.false;
    });
    it('size', function () {
      //expect(Iterator.range(0,5,1)).have.property('size', 5);
      //expect(Iterator.range(5,0,-1)).have.property('size', 5);
      //expect(Iterator.range(5,5,1)).have.property('size', 0);
      //expect(Iterator.range(-10,5,-1)).have.property('size', 0);
      expect(Iterator.range(0, 5, 2)).have.property('size', 3);
      expect(Iterator.range(5, 0, -2)).have.property('size', 3);
    });
  });
});