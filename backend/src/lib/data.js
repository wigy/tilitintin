const moment = require('moment');
const config = require('../config');
const db = require('./db');

const dateFields = {
  account: [],
  document: ['date'],
  entry: [],
  period: ['start_date', 'end_date'],
};

const plural = {
  account: 'accounts',
  document: 'documents',
  entry: 'entries',
  period: 'periods',
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

// TODO: Rename.
function fillEntries (entries, className, joinClass) {
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

function listAll(className, where, order) {
  let ret = db.select('*').from(className);
  if (where) {
    ret = ret.where(where);
  }
  if (order) {
    ret.orderBy.apply(ret, order);
  }
  return ret.then(entries => fillEntries(entries, className));
}

function getOne(className, id, joinClass=null, joinClassOrder=null) {
  let ret = null;
  return db.select('*').from(className).where({'id': id}).then(entries => {
      ret = entries.length ? fillEntries(entries, className)[0] : null;
      if (joinClass) {
        const where = {};
        where[className + '_id'] = id;
        return listAll(joinClass, where, joinClassOrder)
          .then(entries => {
            ret[plural[joinClass]] = fillEntries(entries, joinClass);
            return ret;
          });
      } else {
        return ret;
      }
    }
  );
}

module.exports = {
  api: fillEntries, // TODO: Remove
  fillEntries: fillEntries,
  listAll: listAll,
  getOne: getOne
};
