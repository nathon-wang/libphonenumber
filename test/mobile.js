/* Mocha test
   to use:
     npm install mocha
     mocha <filename>
   or
     npm test
*/

var assert = require('assert');
var libphonenumber = require('../lib/index');

describe('Valid mobile number', function () {
  it('should be accepted', function (done) {
    var mobile = 18700724039;
      libphonenumber.getRegionCodesForCountryCode(86).forEach(function (regionCode) {
        libphonenumber.isPossibleMobile(mobile, regionCode, function (error, result) {
            assert.equal(result, true);
        });
      })
      return done();
  });
});
