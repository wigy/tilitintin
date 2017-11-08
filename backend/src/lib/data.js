const moment = require('moment');

module.exports = {
  api: (entries, className, dates=[]) => {
    return entries.map(e => {
      dates.forEach(d => e[d] = moment(e[d]));
      e.class = className;
      return e;
    });
  }
};
