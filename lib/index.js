var path = require('path');

COMPILED = false;
var closureBasePath = path.join(__dirname, '/closure/goog/');
var goog = require('closure').Closure({CLOSURE_BASE_PATH: closureBasePath});

goog.require('goog.array');
goog.require('goog.proto2.PbLiteSerializer');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.json');

goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonemetadata.pb.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonenumber.pb.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/metadata.js');
goog.loadScript(closureBasePath + 'i18n/phonenumbers/phonenumberutil.js');

var phonenumbers = goog.global.i18n.phonenumbers;
var phoneUtil = phonenumbers.PhoneNumberUtil.getInstance();
var PhoneNumber = phonenumbers.PhoneNumber;
var PhoneNumberType = phonenumbers.PhoneNumberType;
var PhoneNumberFormat = phonenumbers.PhoneNumberFormat;
var ValidationResult = phonenumbers.PhoneNumberUtil.ValidationResult;
var ValidationErrors = phonenumbers.Error;

var getRegionCodesForCountryCode = function (code) {
    if (!isNaN(parseInt(code))) {
        return phoneUtil.getRegionCodesForCountryCode(code);
    } else {
        throw new Error('Invalid Country Code');
    }
};

var validateNumber = function (number, regionCode) {
  var error = null;
  var result = null;

  // Strip out everything that's not a phone number.
  if (number) {
    var potentialPhoneNumber = number.toString();
    potentialPhoneNumber = potentialPhoneNumber.replace(/[^\+0-9]/, '');
    // E164 format numbers start with a plus sign.  If you have a plus sign
    // anywhere else, this is not a phone number.  If you don't have a plus
    // sign yet, don't worry, we'll give you one.
    if (potentialPhoneNumber.lastIndexOf('+') <= 0) {
      try {
        potentialPhoneNumber = phoneUtil.parse(potentialPhoneNumber, regionCode);
        var quickReason = phoneUtil.isPossibleNumberWithReason(potentialPhoneNumber);
        if (quickReason !== ValidationResult.IS_POSSIBLE) {
          for (var code in ValidationResult) {
            if (ValidationResult[code] === quickReason) {
              error = new Error(ValidationErrors[code]);
            }
          }
          if (error === null) {
            error = new Error('Invalid number (unspecified reason)');
          }
        } else {
          if (phoneUtil.isValidNumber(potentialPhoneNumber)) {
            result = potentialPhoneNumber;
          } else {
            error = new Error('Invalid number');
          }
        }
      } catch (e) {
        error = e;
      }
    } else {
      error = new Error('Not a phone number');
    }
  } else {
    error = new Error('No number given');
  }

  if (error) {
    throw error;
  } else {
    return result;
  }
};

var getNumberType = function (number, regionCode, callback) {
    var error = null;
    var result = null;

    try {
        var validNumber = validateNumber(number, regionCode);
        result = phoneUtil.getNumberType(validNumber);
    }
    catch (e) {
        error = e;
    }

    if (callback) {
        callback(error, result);
    } else if (error) {
        throw error;
    } else {
        return result;
    }
};

var isPossibleMobile = function (number, regionCode, callback) {
    var error = null;
    var result = null;

    try {
        var phoneType = getNumberType(number, regionCode);
        result = phoneType === PhoneNumberType.MOBILE || phoneType === PhoneNumber.FIXED_LINE_OR_MOBILE;
    }
    catch (e) {
        error = e;
    }

    if (callback) {
        callback(error, result);
    } else if (error) {
        throw error;
    } else {
        return result;
    }
};

var formatNumber = function (number, regionCode, numberFormat, callback) {
  var error = null;
  var result = null;

  try {
    var validNumber = validateNumber(number, regionCode);
    result = phoneUtil.format(validNumber, numberFormat);
  }
  catch (e) {
    error = e;
  }

  if (callback) {
    callback(error, result);
  } else if (error) {
    throw error;
  } else {
    return result;
  }
};

var validate = function (number, regionCode, callback) {
  var error = null;
  var result = null;

  try {
    var validNumber = validateNumber(number, regionCode);
    result = validNumber instanceof PhoneNumber;
  }
  catch (e) {
    error = e;
  }

  if (callback) {
    callback(error, result);
  } else if (error) {
    throw error;
  } else {
    return result;
  }
};

var e164 = function (number, regionCode, callback) {
  return formatNumber(number, regionCode, PhoneNumberFormat.E164, callback);
};

var intl = function (number, regionCode, callback) {
  return formatNumber(number, regionCode, PhoneNumberFormat.INTERNATIONAL, callback);
};

module.exports = {
  'validate': validate,
  'e164': e164,
  'intl': intl,
  'types': PhoneNumberType,
  'getRegionCodesForCountryCode': getRegionCodesForCountryCode,
  'getNumberType': getNumberType,
  'isPossibleMobile': isPossibleMobile,
  'phoneUtil': phoneUtil
};
