const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const glob = require('glob')
const jwt = require('jsonwebtoken')
const config = require('../config')

function validUserName(name) {
  return name && /^[a-z0-9]+$/.test(`${name}`)
}

/**
 * Validate new user data.
 * @param {String} user
 * @param {String} name
 * @param {String} password
 * @param {String} email
 * @returns {true|String}
 */
function validateUser(user, name, password, email) {
  if (!validUserName(user)) {
    return 'User name is not valid (lower case letters and numbers only).'
  }
  if (password.length < 4) {
    return 'Password is too short.'
  }
  if (!email) {
    return 'Email is required.'
  }
  if (!name) {
    return 'Full name is required.'
  }
  if (hasUser(user)) {
    return 'User already exists.'
  }
  return true
}

/**
 * Create new user.
 * @return {Promise<Boolean>}
 */
async function registerUser({ user, name, email, password, admin }) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            const authDir = admin ? config.DBPATH : path.join(config.DBPATH, user)
            const authPath = path.join(authDir, 'auth.json')
            if (!fs.existsSync(authDir)) {
              fs.mkdirSync(authDir)
            }
            fs.writeFileSync(authPath, JSON.stringify({ user, name, email, password: hash }))
            resolve(true)
          }
        })
      }
    })
  })
}

/**
 * Check if the admin user has been created.
 * @return {Boolean}
 */
function hasAdminUser() {
  return fs.existsSync(path.join(config.DBPATH, 'auth.json'))
}

/**
 * Get the name of the admin user.
 */
function adminUser() {
  if (hasAdminUser()) {
    return require(path.join(config.DBPATH, 'auth.json')).user
  }
}

/**
 * Check if the user has been created.
 * @return {Boolean}
 */
function hasUser(user) {
  return user === adminUser() || fs.existsSync(path.join(config.DBPATH, user, 'auth.json'))
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
    const json = JSON.parse(fs.readFileSync(path))
    if (json.user !== user) {
      resolve(false)
    } else {
      bcrypt.compare(password, json.password, function(err, isMatch) {
        if (err) {
          console.error(err)
          resolve(false)
        } else {
          resolve(isMatch)
        }
      })
    }
  })
}

/**
 * Log in and produce an access token if successful.
 */
async function login(user, password) {
  let token = null
  if (!user || !password) {
    return token
  }
  if (fs.existsSync(path.join(config.DBPATH, user, 'auth.json'))) {
    if (await verifyPassword(path.join(config.DBPATH, user, 'auth.json'), user, password)) {
      token = jwt.sign({ service: 'Tilitintin', user: user, login: true }, config.SECRET)
    }
  }
  if (!token && hasAdminUser()) {
    if (await verifyPassword(path.join(config.DBPATH, 'auth.json'), user, password)) {
      token = jwt.sign({ service: 'Tilitintin', user: user, login: true, isAdmin: true }, config.SECRET)
    }
  }
  return token
}

/**
 * Check that token is properly signed.
 * @param {String} token
 * @return {Promise<Null|Object>}
 */
async function verifyToken(token, needAdmin = false, needLogin = true) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.SECRET, (err, decoded) => {
      if (err) {
        resolve(null)
      } else if (decoded.service !== 'Tilitintin' || (needLogin && !decoded.login)) {
        resolve(null)
      }
      if (needAdmin && !decoded.isAdmin) {
        resolve(null)
      }
      resolve(decoded)
    })
  })
}

/**
 * Get all users.
 */
async function getAll() {
  return new Promise((resolve, reject) => {
    glob.glob(path.join(config.DBPATH, '*', 'auth.json'), function(err, matches) {
      if (err) {
        reject(err)
      } else {
        const users = matches.map((path) => {
          const json = JSON.parse(fs.readFileSync(path))
          return {
            user: json.user,
            name: json.name || null,
            email: json.email || null
          }
        })
        resolve(users)
      }
    })
  })
}

/**
 * Get one user data.
 */
async function getOne(user) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(config.DBPATH, user, 'auth.json')
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`User ${user} does not exist.`))
    } else {
      const json = JSON.parse(fs.readFileSync(filePath))
      resolve({
        user: json.user,
        name: json.name || null,
        email: json.email || null
      })
    }
  })
}

/**
 * Delete a user.
 */
async function deleteOne(user) {
  return new Promise((resolve, reject) => {
    if (!validUserName(user)) {
      return reject(new Error('Invalid user name'))
    }
    const filePath = path.join(config.DBPATH, user, 'auth.json')
    if (!fs.existsSync(filePath)) {
      reject(new Error(`User ${user} does not exist.`))
    } else {
      fs.rmdirSync(path.join(config.DBPATH, user), { recursive: true })
      resolve()
    }
  })
}

module.exports = {
  getAll,
  getOne,
  deleteOne,
  hasAdminUser,
  hasUser,
  login,
  registerUser,
  validateUser,
  verifyToken
}
