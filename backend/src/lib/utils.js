const moment = require('moment')

/**
 * Convert API date to database format in Tilitin compatible way.
 * @param {String} date
 * @return {Number}
 */
function dateToDb(date) {
  const num = moment.utc(date).add(-2, 'hours').unix() * 1000
  return num
}

/**
 * Convert database date to API format in Tilitin compatible way.
 * @param {Number} date
 * @return {String}
 */
function dateFromDb(date) {
  const str = moment.utc(date).add(2, 'hours').format('YYYY-MM-DD')
  return str
}

module.exports = {
  dateToDb,
  dateFromDb
}
