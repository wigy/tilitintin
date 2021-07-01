/**
 * Quick and dirty solution for localization.
 * @param {Number} n
 */
function num(n, lang) {
  if (n === null) {
    return '—' // Emdash
  }
  n /= 100
  switch (lang) {
    case 'fi':
      return ('' + n).replace('.', ',')
  }
  return '' + n
}

module.exports = {
  num
}
