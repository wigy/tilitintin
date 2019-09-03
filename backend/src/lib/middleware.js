const config = require('../config');
const users = require('../lib/users');
const knex = require('./knex');

/**
 * Check the token and set `user` to the request, if valid.
 */
async function checkToken(req, res, next) {

  if (config.AUTO_LOGIN_USER) {
    req.user = config.AUTO_LOGIN_USER;
    next();
    return;
  }

  let token;

  const { authorization } = req.headers;
  if (authorization && authorization.substr(0, 7) === 'Bearer ') {
    token = authorization.substr(7, authorization.length - 7);
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    res.status(403).send('Unauthorized.');
    return;
  }

  const user = await users.verifyToken(token);
  if (!user) {
    res.status(403).send('Unauthorized.');
    return;
  }

  req.user = user.user;
  knex.setUser(req.user);

  next();
}

/**
 * Check the token and that is for admin and set `user` to the request, if valid.
 */
async function checkAdminToken(req, res, next) {
  // TODO: DRY checkToken()
  let token;

  const { authorization } = req.headers;
  if (authorization && authorization.substr(0, 7) === 'Bearer ') {
    token = authorization.substr(7, authorization.length - 7);
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    res.status(403).send('Unauthorized.');
    return;
  }

  const user = await users.verifyToken(token, true);

  if (!user || !user.isAdmin) {
    res.status(403).send('Unauthorized.');
    return;
  }

  req.user = user.user;
  knex.setUser(req.user);

  next();
}

module.exports = {
  checkToken,
  checkAdminToken
};
