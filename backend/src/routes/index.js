const express = require('express');
const router = express.Router();
const config = require('../config');
const knex = require('../lib/knex');
const users = require('../lib/users');

/**
 * Authenticate against fixed credentials and construct a token.
 */
router.post('/auth', async (req, res) => {
  const {user, password} = req.body;
  if (await users.login(user, password)) {
    res.send({token: users.signToken(user)});
  } else {
    res.status(401).send('Invalid user or password.');
  }
});

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
  next();
}

/**
 * Get the readiness status of the application.
 */
router.get('/status', (req, res) => {
  res.send({hasAdminUser: users.hasAdminUser()});
});

/**
 * Create new user.
 */
router.post('/register', async (req, res) => {
  const {user, password, admin} = req.body;
  if (admin) {
    if (users.hasAdminUser()) {
      res.sendStatus(400);
    } else {
      if (!await users.registerAdmin(user, password)) {
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    }
  } else {
    res.send({user, password, admin});
  }
});

router.get('/', checkToken, (req, res) => {
  res.send({
    links: {
      databases: config.BASEURL + '/db'
    }});
});

router.get('/db/', checkToken, (req, res) => {
  res.send(knex.dbs(req.user).map(db => {
    return {name: db, links: {view: config.BASEURL + '/db/' + db}};
  }));
});

function checkDb(req, res, next) {
  const {db} = req.params;
  if (!knex.isDb(req.user, db)) {
    res.status(404).send('Database not found.');
  } else {
    req.db = db;
    knex.setUser(req.user);
    next();
  }
}

router.get('/db/:db', checkToken, checkDb, (req, res) => {
  const {db} = req.params;
  res.send({
    links: {
      periods: config.BASEURL + '/db/' + db + '/period',
      accounts: config.BASEURL + '/db/' + db + '/account',
      documents: config.BASEURL + '/db/' + db + '/document',
      entries: config.BASEURL + '/db/' + db + '/entry',
      headings: config.BASEURL + '/db/' + db + '/heading',
      tags: config.BASEURL + '/db/' + db + '/tags',
      report: config.BASEURL + '/db/' + db + '/report'
    }});
});

router.use('/db/:db/period', checkToken, checkDb, require('./period'));
router.use('/db/:db/account', checkToken, checkDb, require('./account'));
router.use('/db/:db/document', checkToken, checkDb, require('./document'));
router.use('/db/:db/entry', checkToken, checkDb, require('./entry'));
router.use('/db/:db/heading', checkToken, checkDb, require('./heading'));
router.use('/db/:db/tags', checkToken, checkDb, require('./tags'));
router.use('/db/:db/report', checkToken, checkDb, require('./report'));
router.use('/db/:db/settings', checkToken, checkDb, require('./settings'));

module.exports = router;
