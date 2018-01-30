// Multiplier used to round trade amounts.
const DIGITS = 1000000000;

module.exports = {

  /**
   * Trim a number with optional unit to the constant amount of decimals.
   */
  trim: function(num, unit=null) {
    let ret = (Math.round(num * DIGITS) / DIGITS).toString();
    if (!/^-/.test(ret)) {
      ret = '+' + ret;
    }

    ret = ret.replace(/0+$/,'');
    ret = ret.replace(/\.$/,'');
    ret = ret.replace(/e-[0-9]+$/,'');

    ret = ret === '+' ? '+0' : ret;

    if (unit !== null) {
      ret += ' ' + unit;
    }

    return ret;
  }

};
