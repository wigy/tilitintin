const moment = require('moment');
const config = require('../config');

const dateFields = {
  account: [],
  document: ['date'],
  entry: [],
  period: ['start_date', 'end_date'],
};

const fields = {
  "period": {
    "end_date": true,
    "locked": true,
    "start_date": true,
  },
  "document": {
    "period_id": true,
    "number": true,
    "date": true,
  },
  "entry": {
    "document_id": true,
    "account_id": true,
    "amount": true,
    "debit": true,
    "description": true,
    "flags": true,
    "row_number": true,
  },
  "account": {
    "vat_account1_id": true,
    "vat_account2_id": true,
    "flags": true,
    "name": true,
    "number": true,
    "type": true,
    "vat_code": true,
    "vat_percentage": true,
  },
};

module.exports = {
  api: (entries, className, joinClass) => {
    return entries.map(e => {
      dateFields[className].forEach(d => e[d] = moment(e[d]));
      e.class = className;
      if (e.id) {
        e.links = {view: config.BASEURL + '/' + className + '/' + e.id};
      }
      if (joinClass) {
        let sub = {};
        Object.keys(fields[joinClass]).forEach(key => {
          delete e[key];
          if (fields[className][key]) {
            console.error('Overriding field', key, 'from class', className, 'when joining class', joinClass);
          }
        });
        if (e[joinClass + '_id']) {
          sub.id = e[joinClass + '_id'];
        }
        sub = module.exports.api([sub], joinClass)[0];
        e[joinClass] = sub;
      }
      return e;
    });
  }
};
