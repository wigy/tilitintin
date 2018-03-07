const sprintf = require('sprintf');

// Multiplier used to round trade amounts.
const DIGITS = 100000000;
const ACCURACY = 1 / DIGITS;

module.exports = {

  DIGITS: DIGITS,
  ACCURACY: ACCURACY,

  /**
   * Trim a number with optional unit to the constant amount of decimals.
   */
  trimSigned: function(num, unit=null) {
    let ret;

    if (Math.abs(num) < 1 / DIGITS) {
      ret = '0';
    } else {
      ret = (Math.round(num * DIGITS) / DIGITS).toString();
      if (/e-\d+$/.test(ret)) {
        ret = '0';
      }
    }

    if (!/^-/.test(ret)) {
      ret = '+' + ret;
    }

    ret = ret.replace(/(.+)\.(.*)(0+)$/,'$1.$2');
    ret = ret.replace(/\.$/,'');
    ret = ret === '+' ? '+0' : ret;

    if (unit !== null) {
      ret += ' ' + unit;
    }

    return ret;
  },

  /**
   * Trim a number with optional unit to the constant amount of decimals without '+'.
   */
  trim: function(num, unit=null) {
    return module.exports.trimSigned(num, unit).replace(/^\+/, '');
  },

  /**
   * Convert a mumber to currency with unit.
   */
  currency: function(num, unit, digits=2) {
    let [body, decimals] = sprintf('%.' + digits + 'f', num).split('.');
    if (body.length > 3) {
      body = body.substr(0, body.length - 3) + ',' + body.substr(body.length - 3);
    }
    let ret = body + '.' + decimals;
    if (unit) {
      if (unit === 'USD') {
        ret = '$' + ret;
      } else {
        unit = unit.replace('USD', '$');
        unit = unit.replace('EUR', '€');
        ret += ' ' + unit;
      }
    }
    return ret;
  }
};
