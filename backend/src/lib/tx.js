/**
 * A library for creating transactions.
 */
const moment = require('moment');
const knex = require('./knex');
const data = require('./data');

/**
 * Create new document into the database.
 *
 * @param {string} db
 * @param {number} periodId
 * @param {string} date A date in YYYY-MM-DD format.
 * @return {number} Document ID.
 */
function addDocument(db, periodId, date) {
  const seconds = moment(date + ' 00:00:00').format('x');

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
}

/**
 * Insert transaction into the database.
 *
 * @param {string} db
 * @param {number} periodId
 * @param {string} date A date in YYYY-MM-DD format.
 * @param {array} txs
 *
 * The transaction is an array of entries like
 *   [
 *     {number: 1910, amount: -20.50, description: 'TRE - HKI - TRE'},
 *     {number: 7800, amount: 20.50, description: 'TRE - HKI - TRE'}
 *   ]
 */
function add(db, periodId, date, txs) {

  // Unknown accounts to resolve.
  let accountNumberToId = {};
  // Total amount in transaction.
  let total = 0;

  // Helper to fill in missing information and collect sum for each entry.
  function prepare(tx) {
    if (!tx.accountId) {
      if (!tx.number) {
        throw new Error('Must have either accountId or number set in TX ' + JSON.stringify(tx));
      }
      accountNumberToId[tx.number] = null;
    }
    tx.debit = 1;
    total += tx.amount;
    if (tx.amount < 0) {
      tx.amount = -tx.amount;
      tx.debit = 0;
    }
    return tx;
  }

  txs = txs.map((tx) => prepare(tx));

  // Check the total.
  if (total) {
    throw new Error('Invalid total ' + total + ' for TXs ' + JSON.stringify(txs));
  }

  // Second helper to fill missing account IDs and making final checks.
  function fill(tx) {
    tx.accountId = tx.accountId || accountNumberToId[tx.number];
    return tx;
  }

  // Fill in account IDs, where missing.
  return Promise.all(Object.keys(accountNumberToId).map((number) => data.getAccountId(db, number)))
    .then((mapping) => {
      mapping.forEach((map) => accountNumberToId[map.number] = map.id);
      txs = txs.map((tx) => fill(tx));

      return txs;
    })
  //return addDocument(db, periodId, date);
}

module.exports = {
  add: add,
};
