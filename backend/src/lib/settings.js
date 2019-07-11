const knex = require('./knex');

/**
 * Check if settings table is available.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<boolean>}
 */
async function isReady(db) {
  return knex.db(db).schema.hasTable('fyffe_settings');
}

/**
 * Make sure that table for settings exists.
 * @param {string} db The database name without `.sqlite`.
 * @return {Promise<true>}
 */
async function ensure(db) {
  return isReady(db)
    .then((yes) => {
      if (yes) {
        return Promise.resolve(true);
      }
      return knex.db(db).schema.createTable('fyffe_settings', function (table) {
        table.string('name', 64).notNullable();
        table.text('value').notNullable();
        table.unique('name');
      })
        .then(() => true);
    });
}

/**
 * Set the value for the setting variable.
 */
async function set(db, variable, value) {
  await ensure(db);
  return knex.db(db)('fyffe_settings').select('name').where({name: variable}).first()
    .then(res => {
      return res ? knex.db(db)('fyffe_settings').update({value: JSON.stringify(value)}).where({name: variable})
        : knex.db(db)('fyffe_settings').insert({name: variable, value: JSON.stringify(value)});
    });
}

/**
 * Get the value of the setting variable or default, if not set.
 */
async function get(db, variable, def = undefined) {
  await ensure(db);
  return knex.db(db)('fyffe_settings').select('value').where({name: variable}).first()
    .then(res => res ? JSON.parse(res.value) : def);
}

/**
 * Get all settings as an object.
 * @param {String} db
 */
async function getAll(db) {
  await ensure(db);
  return knex.db(db)('fyffe_settings').select('*')
    .then((data) => {
      const ret = {};
      data.forEach((setting) => {
        ret[setting.name] = setting.value;
      });
      return ret;
    });
}

module.exports = { get, set, getAll };
