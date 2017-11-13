const fs = require('fs');
const knex = require('knex');
const config = require('../config');
const glob = require('glob');

if (!fs.existsSync(config.DBPATH)) {
  throw new Error('Configured DBDBPATH ' + config.DBDBPATH + ' does not exist. Please set environment DBDBPATH.');
}

function dbs() {
  return glob.sync(config.DBPATH + '/*.sqlite').map(path => path.replace(/.*\/(.*)\.sqlite$/, '$1'));
}

function isdb(name) {
  return dbs().includes(name);
}

function db(name) {
  if (!isdb(name)) {
    throw new Error('No such DB as ' + name);
  }
  return knex({
    client: 'sqlite3',
    connection: {
        filename: config.DBPATH + '/' + name + '.sqlite'
    },
    useNullAsDefault: true
  });
}

module.exports = {
  dbs: dbs,
  isdb: isdb,
  db: db
};
