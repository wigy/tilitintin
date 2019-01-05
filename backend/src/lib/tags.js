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

/**
 * Get all tags.
 * @param {string} db The database name without `.sqlite`.
 */
function getAll(db) {
  return ensure(db)
    .then(() => {
      return knex.db(db).select('*').from('tags').orderBy('order');
    });
}

/**
 * Insert a tag.
 * @param {string} db The database name without `.sqlite`.
 * @param {string} tag
 * @param {string} name
 * @param {string} picture
 * @param {string} type
 * @param {integer} order
 * @return {Promise}
 */
function add(db, tag, name, picture, type, order) {
  return ensure(db)
    .then(() => {
      return knex.db(db)('tags').insert({
        tag: tag,
        name: name,
        picture: picture,
        type: type,
        order: order
      });
    });
}

module.exports = {
  isReady: isReady,
  add: add,
  ensure: ensure,
  getAll: getAll
};
