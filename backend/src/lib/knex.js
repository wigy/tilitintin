const fs = require('fs');
const knex = require('knex');
const config = require('../config');
const glob = require('glob');

if (!fs.existsSync(config.DBPATH)) {
  throw new Error('Configured DBPATH ' + config.DBPATH + ' does not exist. Please set environment DBPATH.');
}

/**
 * Get the list of database names available.
 * @param {String} user
 * @return {String[]} A list of base names without `.sqlite`.
 */
function dbs(user) {
  if (!user) {
    return [];
  }
  return glob.sync(config.DBPATH + '/' + user + '/*.sqlite').map(path => path.replace(/.*\/(.*)\.sqlite$/, '$1'));
}

/**
 * Check if database exists.
 * @param {String} user
 * @param {String} name The database name without `.sqlite`.
 * @returns {Boolean}
 */
function isDb(user, name) {
  return dbs(user).includes(name);
}

// Current user.
let user = null;

/**
 * Set the current user.
 * @param {String} u
 */
function setUser(u) {
  user = u;
}

/**
 * Get the database handle for the current user.
 * @param {String} name The database name without `.sqlite`.
 * @return {Knex} A configured knex instance.
 */
function db(name) {
  if (!user || !isDb(user, name)) {
    throw new Error('No such DB as ' + name);
  }
  return knex({
    client: 'sqlite3',
    connection: {
      filename: userPath(name + '.sqlite')
    },
    useNullAsDefault: true
  });
}

/**
 * Construct a path to the user file.
 * @param {String} basename
 */
function userPath(basename) {
  return config.DBPATH + '/' + user + '/' + basename;
}

/**
 * Check if the user file exists and return its path.
 * @param {String} basename
 * @return {String|null}
 */
function userFile(basename) {
  if (!basename) {
    return null;
  }
  const path = userPath(basename);
  return fs.existsSync(path) ? path : null;
}

module.exports = {
  dbs,
  isDb,
  setUser,
  db,
  userPath,
  userFile,
  knex
};
