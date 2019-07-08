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
    if (json.user !== user) {
      resolve(false);
    } else {
      bcrypt.compare(password, json.password, function(err, isMatch) {
        if (err) {
          console.error(err);
          resolve(false);
        } else {
          resolve(isMatch);
        }
      });
    }
  });
}

/**
 * Log in and produce an access token if successful.
 */
async function login(user, password) {
  let token = null;
  if (fs.existsSync(path.join(config.DBPATH, user, 'auth.json'))) {
    if (await verifyPassword(path.join(config.DBPATH, user, 'auth.json'), user, password)) {
      token = jwt.sign({service: 'Tilitintin', user: user}, config.SECRET);
    }
  }
  if (!token && hasAdminUser()) {
    if (await verifyPassword(path.join(config.DBPATH, 'auth.json'), user, password)) {
      token = jwt.sign({service: 'Tilitintin', user: user, isAdmin: true}, config.SECRET);
    }
  }
  return token;
}

/**
 * Check that token is properly signed.
 * @param {String} token
 * @return {Promise<Null|Object>}
 */
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.SECRET, (err, decoded) => {
      if (err) {
        resolve(null);
      } else if (decoded.service !== 'Tilitintin') {
        resolve(null);
      }
      resolve(decoded);
    });
  });
}

/**
 * Sign a token for a user.
 * @param {String} user
 */
function signToken(user) {
  return jwt.sign({service: 'Tilitintin', user}, config.SECRET);
}

module.exports = {
  hasAdminUser,
  login,
  registerAdmin,
  signToken,
  verifyToken
};
