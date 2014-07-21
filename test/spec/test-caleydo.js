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
  });
});
