const sprintf = require('sprintf');

// Multiplier used to round trade amounts.
const DIGITS = 1000000;

module.exports = {

  /**
   * Trim a number with optional unit to the constant amount of decimals.
   */
  trim: function(num, unit=null) {
    let ret;

    if (Math.abs(num) < 1 / DIGITS) {
      ret = '0';
    } else {
      ret = (Math.round(num * DIGITS) / DIGITS).toString();
    }

    if (!/^-/.test(ret)) {
      ret = '+' + ret;
    }

    ret = ret.replace(/0+$/,'');
    ret = ret.replace(/\.$/,'');

    ret = ret === '+' ? '+0' : ret;

    if (unit !== null) {
      ret += ' ' + unit;
    }

    return ret;
  },

  /**
   * Convert a mumber to currency with unit.
   */
  currency: function(num, unit) {
    let ret = sprintf('%.2f', num);
    if (ret.length > 6) {
      ret = ret.substr(0, ret.length - 6) + ',' + ret.substr(ret.length - 6);
    }
    ret += ' ' + unit;
    return ret;
  }
};
