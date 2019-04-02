import moment from 'moment';
import { sprintf } from 'sprintf-js';
import i18n from './i18n';

/**
 * Convert a date 'YYYY-MM-DD' to localized version.
 * @param {String} date
 */
export function date2str(date) {
  const lang = i18n.language;
  return new Date(date).toLocaleDateString(lang);
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
    case 'fi':
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
