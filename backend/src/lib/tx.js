/**
 * A library for creating transactions.
 */
const promiseSeq = require('promise-sequential');
const moment = require('moment');
const knex = require('./knex');
const data = require('./data');

/**
 * Find the period id for the date.
 *
 * @param {string} db Name of the database.
 * @param {string} date A date in YYYY-MM-DD format.
 * @param {Boolean} If set, raise error on missing period.
 * @return {number} Period ID or null if not found.
 */
function periodOf(db, date, failOnError=false) {
  const seconds = moment(date + ' 00:00:00').format('x');
  return knex.db(db)
    .select('id')
    .from('period')
    .where('start_date', '<=', seconds)
    .andWhere('end_date', '>', seconds)
    .then((period) => period.length ? period[0].id : null)
    .then((periodId) => {
      if (periodId === null && failOnError) {
        throw new Error('Cannot find period for ' + JSON.stringify(date) + ' from database ' + JSON.stringify(db));
      }
      return periodId;
    });
}

/**
 * Create new document into the database.
 *
 * @param {string} db Name of the database.
 * @param {string} date A date in YYYY-MM-DD format.
 * @return {number} Document ID.
 */
function addDocument(db, date) {
  const seconds = moment(date + ' 00:00:00').format('x');
  return periodOf(db, date, true)
    .then((periodId) => {
      return knex.db(db)
      .select(knex.db(db).raw('MAX(number) + 1 as number'))
      .from('document')
      .then((nums) => nums ? nums[0].number : 1)
      .then((number) => {
        return knex.db(db)('document')
        .insert({
          number: number,
          period_id: periodId,
          date: seconds
        })
        .then((ids) => ids[0]);
      });
    });
}

/**
 * Create new entry into the database.
 *
 * @param {string} db Name of the database.
 * @param {number} accountId ID of the account.
 * @param {number} documentId ID of the document, the entry belongs to.
 * @param {number} debit If 1, then this is debit, otherwise credit.
 * @param {number} amount
 * @param {string} desc
 * @param {number} row Order number of the entry 1..n.
 * @param {number} flags
 */
function addEntry(db, accountId, documentId, debit, amount, desc, row, flags) {
  return knex.db(db)('entry')
    .insert({
      document_id: documentId,
      account_id: accountId,
      debit: debit,
      amount: amount,
      description: desc,
      row_number: row,
      flags: flags,
    });
}

/**
 * Helper to check if the collection of entries is already in the database.
 * @param {string} db Name of the database.
 * @param {string} date A date in YYYY-MM-DD format.
 * @param {Array} txs A list of object prepared by `add()`.
 * @return {Promise<Boolean>} Promise resolving to true, if transaction is found.
 */
function _checkTxs(db, date, txs) {
  return periodOf(db, date)
    .then((periodId) => {
      if (!periodId) {
        return false;
      }
      return Promise.reject(new Error('Just testing'));
    });
}

/**
 * Insert transaction into the database.
 *
 * @param {string} db Name of the database.
 * @param {string} date A date in YYYY-MM-DD format.
 * @param {string} description A text to be added to each entry.
 * @param {array} txs List of transactions.
 * @return {array} A list on entry IDs created.
 *
 * The transaction is an array of entries like
 *   [
 *     {number: 1910, amount: -20.50},
 *     {number: 7800, amount: 20.50}
 *   ]
 * Missing pieces are filled in as necessary. Account can be given as a `number` or
 * an `accountId`.
 */
function add(db, date, description, txs) {

  // Unknown accounts to resolve.
  let accountNumberToId = {};
  // Total amount in transaction.
  let total = 0;
  // Counter for line number.
  let line = 1;
  // Last description.
  let desc = description;

  // Helper to fill in missing information and collect sum for each entry.
  function prepare(tx) {
    if (!tx.accountId) {
      if (!tx.number) {
        throw new Error('Must have either accountId or number set in TX ' + JSON.stringify(tx));
      }
      accountNumberToId[tx.number] = null;
    }

    // Check is it debit or credit.
    tx.debit = 1;
    total += tx.amount;
    if (tx.amount < 0) {
      tx.amount = -tx.amount;
      tx.debit = 0;
    }

    // Handle line number and description.
    tx.row = line++;
    if (tx.description) {
      desc = tx.description;
    } else {
      tx.description = desc;
    }

    tx.flags = tx.flags || 0;

    return tx;
  }

  txs = txs.map((tx) => prepare(tx));

  // Check the total.
  total = Math.round(100*total) / 100;
  if (total) {
    throw new Error('Invalid total ' + total + ' for TXs ' + JSON.stringify(txs));
  }

  // Second helper to fill in missing account IDs and making final checks.
  function fill(tx) {
    tx.accountId = tx.accountId || accountNumberToId[tx.number];
    if (!tx.amount) {
      throw new Error('Missing `amount` in TX ' + JSON.stringify(tx));
    }
    if (!tx.description) {
      throw new Error('Missing `description` in TX ' + JSON.stringify(tx));
    }
    if (!tx.accountId) {
      throw new Error('Missing `accountId` in TX ' + JSON.stringify(tx));
    }
    return tx;
  }

  // Fill in account IDs, where missing and do final checks.
  return Promise.all(Object.keys(accountNumberToId).map((number) => data.getAccountId(db, number)))
    .then((mapping) => {
      mapping.forEach((map) => {
        if (!map) {
          return;
        }
        accountNumberToId[map.number] = map.id;
      });
      txs = txs.map((tx) => fill(tx));
      return _checkTxs(db, date, txs);
    })
    .then(() => addDocument(db, date))
    .then((documentId) => {
      const creators = txs.map((tx) => () => addEntry(db, tx.accountId, documentId, tx.debit, tx.amount, tx.description, tx.row, tx.flags));
      return promiseSeq(creators);
    });
}

module.exports = {
  add: add,
};
