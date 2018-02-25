const knex = require('./knex');

/**
 * Check if import bookkeeping table is available.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<boolean>}
 */
function isImportReady(db) {
  return knex.db(db).schema.hasTable('imports');
}

/**
 * Make sure that table for import bookkeeping exists.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<true>}
 */
function ensureImport(db) {
  return isImportReady(db)
    .then((yes) => {
      if (yes) {
        return Promise.resolve(true);
      }
      return knex.db(db).schema.createTable('imports', function (table) {
        table.increments('id').primary();
        table.string('service_tag', 16).notNullable();
        table.string('tx_id', 256).notNullable();
        table.integer('document_id').nullable();

        table.unique(['service_tag', 'tx_id']);
        table.index('document_id');
      })
      .then(() => true);
    });
}

/**
 * Insert an import mark.
 * @param {string} db The database name without `.sqlite`.
 * @param {string} serviceTag
 * @param {string} txId
 * @param {string} docId
 * @return {Promise}
 */
function addImport(db, serviceTag, txId, docId) {
  return ensureImport(db)
    .then(() => {
      return knex.db(db)('imports').insert({
        service_tag : serviceTag,
        tx_id: txId,
        document_id : docId
      });
    });
}

/**
 * Check if an entry is imported.
 * @param {string} db The database name without `.sqlite`.
 * @param {string} serviceTag
 * @param {string} txId
 * @return {Promise<Boolean>}
 */
function hasImport(db, serviceTag, txId) {
  return ensureImport(db)
    .then(() => {
      return knex.db(db)('imports').where({
        service_tag : serviceTag,
        tx_id: txId
      });
    })
    .then((matches) => matches.length > 0);
}

module.exports = {
  imports: {
    isReady: isImportReady,
    ensure: ensureImport,
    add: addImport,
    has: hasImport
  }
};
