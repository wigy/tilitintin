const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Create new admin user and override old.
 * @param {String} user
 * @param {String} password
 * @return {Promise<Boolean>}
 */
async function registerAdmin(user, password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            fs.writeFileSync(config.DBPATH + '/auth.json', JSON.stringify({user, salt, password: hash}));
            resolve(true);
          }
        });
      }
    });
  });
}

/**
 * Check if the admin user has been created.
 * @return {Boolean}
 */
function hasAdminUser() {
  return fs.existsSync(path.join(config.DBPATH, 'auth.json'));
}

/**
 * Check if the user password pair matches to the given authorization json-file content.
 * @param {String} path
 * @param {String} user
 * @param {String} password
 * @return {Promise<Boolean>}
 */
async function verifyPassword(path, user, password) {
  return new Promise((resolve, reject) => {
    const json = JSON.parse(fs.readFileSync(path));
    bcrypt.compare(password, json.password, function(err, res) {
      if (err) {
        console.log(err);
        resolve(false);
      } else {
        console.log('ok');
        resolve(res);
      }
    });
  });
}

/**
 * Log in and produce an access token if successful.
 */
async function login(user, password) {
  let token = null;
  if (hasAdminUser()) {
    if (await verifyPassword(path.join(config.DBPATH, 'auth.json'), user, password)) {
      token = jwt.sign({service: 'Tilitintin', user: user}, config.SECRET);
    }
  }
  return token;
}

module.exports = {
  hasAdminUser,
  login,
  registerAdmin
};
