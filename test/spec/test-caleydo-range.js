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
    })
  });
});