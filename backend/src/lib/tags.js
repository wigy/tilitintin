const knex = require('./knex');

/**
 * Check if tags table is available.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<boolean>}
 */
function isReady(db) {
  return knex.db(db).schema.hasTable('tags');
}

/**
 * Make sure that table for tags exists.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<true>}
 */
function ensure(db) {
  return isReady(db)
    .then((yes) => {
      if (yes) {
        return Promise.resolve(true);
      }
      return knex.db(db).schema.createTable('tags', function (table) {
        table.increments('id').primary();
        table.string('tag', 16).notNullable();
        table.string('name', 256).nullable();
        table.string('picture', 512).nullable();
        table.string('type', 16).nullable();
        table.integer('order');

        table.unique('tag');
        table.index('type');
        table.index('order');
      })
      .then(() => true);
    });
}

function getAll(db) {
  return ensure(db)
    .then(() => {})
}

module.exports = {
  isReady: isReady,
  getAll: getAll
};
