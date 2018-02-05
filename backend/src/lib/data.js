/**
 * A collection of data fetching functions.
 */
const moment = require('moment');
const config = require('../config');
const knex = require('./knex');

const dateFields = {
  tags: [],
  account: [],
  document: ['date'],
  entry: [],
  period: ['start_date', 'end_date'],
  coa_heading: [],
};

const plural = {
  account: 'accounts',
  document: 'documents',
  entry: 'entries',
  period: 'periods',
};

const fields = {
  "tags": {
    "tag": true,
    "name": true,
    "picture": true,
    "type": true,
    "order": true,
  },
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
  "coa_heading": {
    "number": true,
    "text": true,
    "level": true,
  },
};

const transformer = {
  "account": (acc) => {
    acc.type = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'PROFIT_PREV', 'PROFIT'][acc.type];
    return acc;
  }
};

/**
 * Fill in some additional information for the entries already fetched from the database.
 * @param {string} db
 * @param {array} entries
 * @param {string} className
 * @param {string} [joinClass]
 */
function fillEntries (db, entries, className, joinClass) {
  return entries.map(e => {
    dateFields[className].forEach(d => e[d] = moment(e[d]));
    e.class = className;
    e.db = db;
    if (e.id) {
      e.links = {view: config.BASEURL + '/db/' + db + '/' + className + '/' + e.id};
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
    if (transformer[className]) {
      e = transformer[className](e);
    }
    return e;
  });
}

/**
 * General purpose query for fetching all entries from a table.
 * @param {string} db
 * @param {string} className
 * @param {object} where
 * @param {array} order
 */
function listAll(db, className, where, order) {
  if (!fields[className]) {
    throw new Error('No definition for enries for ' + className);
  }
  let ret = knex.db(db).select('*').from(className);
  if (where) {
    ret = ret.where(where);
  }
  if (order) {
    ret.orderBy.apply(ret, order);
  }
  return ret.then(entries => fillEntries(db, entries, className));
}

function getOne(db, className, id, joinClass=null, joinClassOrder=null) {
  let ret = null;
  return knex.db(db).select('*').from(className).where({'id': id})
    .then(entries => {
      ret = entries.length ? fillEntries(db, entries, className)[0] : null;
      if (joinClass) {
        const where = {};
        where[className + '_id'] = id;
        return listAll(db, joinClass, where, joinClassOrder)
          .then(entries => {
            ret[plural[joinClass]] = fillEntries(db, entries, joinClass);
            return ret;
          });
      } else {
        return ret;
      }
    });
}

/**
 * Get all accounts having activities on the period.
 * @param {*} db
 * @param {*} periodId
 */
function getPeriodAccounts(db, periodId) {
  return knex.db(db).select('account.id', 'account.number', 'account.name').from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': periodId})
    .orderBy('account.number')
    .groupBy('entry.account_id');
}

function getPeriodCredits(db, periodId) {
  return knex.db(db).select('account.id', 'account.number', 'account.name', knex.db(db).raw('SUM(entry.amount * 100) as amount')).from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': periodId})
    .where({'entry.debit': 0})
    .orderBy('account.number')
    .groupBy('entry.account_id');
}

function getPeriodDebits(db, periodId) {
  return knex.db(db).select('account.id', 'account.number', 'account.name', knex.db(db).raw('SUM(entry.amount * 100) as amount')).from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': periodId})
    .where({'entry.debit': 1})
    .orderBy('account.number')
    .groupBy('entry.account_id');
}

/**
 * Get all balannces for accounts having entries on the given period.
 * @param {*} db
 * @param {*} periodId
 */
function getPeriodBalances(db, periodId) {
  return getOne(db, 'period', periodId)
    .then(data => {
      return getPeriodCredits(db, periodId)
        .then(entries => {
          data.credit = entries;
          return data;
        });
    })
    .then(data => {
      return getPeriodDebits(db, periodId)
        .then(entries => {
          data.debit = entries;
          return data;
        });
    })
    .then(data => {
      let accounts = {};
      data.debit.forEach(item => {
        accounts[item.id] = item;
        accounts[item.id].debit = item.amount;
      });
      data.credit.forEach(item => {
        accounts[item.id] = accounts[item.id] || item;
        accounts[item.id].credit = item.amount;
      });

      data.balances = Object.values(accounts);
      data.balances.forEach(account => {
        delete account.amount;
        account.debit = account.debit || 0;
        account.credit = -account.credit || 0;
        account.total = account.debit + account.credit;
        account.period_id = parseInt(periodId);
        account.links = {
          view: config.BASEURL + '/db/' + db + '/account/' + account.id + '/' + periodId
        };
      });

      data.balances = data.balances.sort((a, b) => (a.number > b.number ? 1 : (a.number < b.number ? -1 : 0)));

      delete data.debit;
      delete data.credit;

      return data;
    });
}

/**
 * Get all transactions for an account during the given period.
 * @param {*} db
 * @param {*} periodId
 * @param {*} accountId
 */
function getAccountTransactions(db, periodId, accountId) {
  return knex.db(db).select('*', knex.db(db).raw('entry.amount * 100 as amount')).from('entry')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': periodId})
    .where({'entry.account_id': accountId})
    .orderBy(['document.date', 'document.number', 'entry.row_number'])
    .then(entries => fillEntries(db, entries, 'document'));
}

/**
 * Get all transactions for an account during the given period including all entries for each transaction.
 * @param {*} db
 * @param {*} periodId
 * @param {*} accountId
 */
function getAccountTransactionsWithEntries(db, periodId, accountId) {
  return getAccountTransactions(db, periodId, accountId)
    .then((txs) => {
      let txByDocID = {};
      const docIds = txs.map((tx) => {
        txByDocID[tx.document_id] = txByDocID[tx.document_id] || [];
        txByDocID[tx.document_id].push(tx);
        tx.entries = [];
        return tx.document_id;
      });
      return knex.db(db).select('*', 'entry.id AS entry_id').from('entry').whereIn('document_id', docIds).orderBy(['document_id', 'row_number'])
        .leftJoin('account', 'account.id', 'entry.account_id')
        .then((entries) => {
          entries.forEach((entry) => {
            entry.amount = Math.round(entry.amount * 100);
            entry.id = entry.entry_id;
            delete entry.entry_id;
            txByDocID[entry.document_id].forEach((tx) => tx.entries.push(entry));
          });
          return txs;
        });
    });
}

/**
 * Get all transactions for an account (specified by account number) during the given period.
 * @param {*} db
 * @param {*} periodId
 * @param {*} accountNumber
 */
function getAccountTransactionsByNumber(db, periodId, accountNumber) {
  return getAccountId(db, accountNumber)
    .then(({id}) => {
      return getAccountTransactions(db, periodId, id);
    });
}

/**
 * Convert account number to ID.
 * @param {*} db
 * @param {number} number Account number.
 * @return An object {id: <id>, number: <number>}
 */
function getAccountId(db, number) {
  return knex.db(db).select('id').from('account')
    .where({'account.number': number})
    .then(account => ({number: number, id: account[0].id}));
}

module.exports = {
  fillEntries: fillEntries,
  listAll: listAll,
  getOne: getOne,
  getPeriodAccounts: getPeriodAccounts,
  getPeriodBalances: getPeriodBalances,
  getAccountId: getAccountId,
  getAccountTransactions: getAccountTransactions,
  getAccountTransactionsWithEntries: getAccountTransactionsWithEntries,
  getAccountTransactionsByNumber: getAccountTransactionsByNumber,
};
