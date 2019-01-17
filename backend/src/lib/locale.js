/**
 * Quick and dirty solution for localization.
 * @param {Number} n
 */
function num(n, lang) {
  switch (lang) {
    case 'fi':
      return ('' + n).replace('.', ',');
  }
  return '' + n;
}

module.exports = {
  num
};
