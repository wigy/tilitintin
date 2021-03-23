import moment from 'moment';
import safeEval from 'safer-eval';
import { sprintf } from 'sprintf-js';
import i18n from './i18n';

/**
 * Convert a date 'YYYY-MM-DD' to localized version.
 * @param {String} date
 */
export function date2str(date) {
  const lang = i18n.language;
  // Note: Date(date).toLocaleDateString(lang) is too slow compared to this.
  switch (lang) {
    case 'en':
      return moment(date).format('YYYY-MM-DD');
    case 'fi':
      return moment(date).format('DD.MM.YYYY');
    default:
      throw new Error(`Language ${lang} not supported.`);
  }
}

/**
 * Convert (possibly partial) localized date to 'YYYY-MM-DD'
 * @param {String} str
 */
export function str2date(str, sample) {
  sample = sample ? new Date(sample) : new Date();
  const lang = i18n.language;
  let year, month, day;
  switch (lang) {
    case 'en':
      if (!/^\d{1,4}(-\d{1,2}(-\d{1,2})?)?$/.test(str)) {
        return undefined;
      }
      [year, month, day] = str.split('-');
      break;
    case 'fi':
      if (!/^\d{1,2}(\.\d{1,2}(\.\d{1,4})?)?$/.test(str)) {
        return undefined;
      }
      [day, month, year] = str.split('.');
      break;
    default:
      throw new Error(`Language ${lang} not supported.`);
  }
  day = parseInt(day);
  month = parseInt(month) || (sample.getMonth() + 1);
  year = parseInt(year) || sample.getFullYear();
  if (year < 100) {
    year += 2000;
  }
  const date = moment(sprintf('%04d-%02d-%02d', year, month, day));
  return date.isValid() ? date.format('YYYY-MM-DD') : undefined;
}

/**
 * Convert a string expression to the evaluated number.
 * @param {String} str
 * @return {NaN|Number}
 */
export function str2num(str, variables = {}) {
  str = str.replace(',', '.').replace(/[$€£]/g, '').replace(/\s/g, '');
  for (const [k, v] of Object.entries(variables)) {
    str = str.replace(new RegExp(k, 'g'), v);
  }
  try {
    return safeEval(str, { navigator: window.navigator });
  } catch (err) {
    return NaN;
  }
}
