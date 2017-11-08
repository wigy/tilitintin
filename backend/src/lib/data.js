const moment = require('moment');
const config = require('../config');
const dateFields = {
  account: [],
  document: ['date'],
  entry: [],
  period: ['start_date', 'end_date'],
};

module.exports = {
  api: (entries, className, additionalDates=[]) => {
    return entries.map(e => {
      dateFields[className].forEach(d => e[d] = moment(e[d]));
      additionalDates.forEach(d => e[d] = moment(e[d]));
      e.class = className;
      e.links = {view: config.BASEURL + '/' + className + '/' + e.id};
      return e;
    });
  }
};
