const moment = require('moment');
const config = require('../config');
const dateFields = {
  account: [],
  document: ['date'],
  entry: [],
  period: ['start_date', 'end_date'],
};

module.exports = {
  api: (entries, className) => {
    return entries.map(e => {
      dateFields[className].forEach(d => e[d] = moment(e[d]));
      e.class = className;
      e.link = config.BASEURL + '/' + className + '/' + e.id;
      return e;
    });
  }
};
