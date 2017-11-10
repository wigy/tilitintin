const fs = require('fs');
const knex = require('knex');
const config = require('../config');

if (!fs.existsSync(config.DB)) {
  throw new Error('Configured DB ' + config.DB + ' does not exist. Please set environment DB.')
}

// TODO: Rename this module as knex.
module.exports = knex({
  client: 'sqlite3',
  connection: {
      filename: config.DB
  },
  useNullAsDefault: true
});
