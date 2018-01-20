/**
 * A library for creating transactions.
 */
const moment = require('moment');
const knex = require('./knex');

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

  // Helper to fill in missing information and collect sum for each entry.
  function prepare(tx) {
    return tx;
  }

  txs = txs.map((tx) => prepare(tx));

  return addDocument(db, periodId, date);
}

module.exports = {
  add: add,
};
