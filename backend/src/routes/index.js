const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const config = require('../config');
const knex = require('../lib/knex');
const users = require('../lib/users');
const { checkToken, checkAdminToken } = require('../lib/middleware');

/**
 * Authenticate against fixed credentials and construct a token.
 */
router.post('/auth', bodyParser.json(), async (req, res) => {
  const {user, password} = req.body;
  const token = await users.login(user, password);
  if (token) {
    res.send({token});
  } else {
    res.status(401).send('Invalid user or password.');
  }
});

/**
 * Get the readiness status of the application.
 */
router.get('/status', (req, res) => {
  res.send({hasAdminUser: users.hasAdminUser()});
});

/**
 * Create new admin user.
 */
router.post('/register', bodyParser.json(), async (req, res) => {
  const {user, name, email, password, admin} = req.body;
  // TODO: Validate as in form.
  if (admin) {
    if (users.hasAdminUser()) {
      res.sendStatus(400);
    } else {
      if (!await users.registerUser({user, name, email, password, admin})) {
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.get('/', checkToken, (req, res) => {
  res.send({
    links: {
      databases: config.BASEURL + '/db'
    }});
});

router.get('/db', checkToken, (req, res) => {
  res.send(knex.dbs(req.user).map(db => {
    return {name: db, links: {view: config.BASEURL + '/db/' + db}};
  }));
});

function checkDb(req, res, next) {
  const {db} = req.params;
  if (!req.user || !knex.isDb(req.user, db)) {
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

router.use('/db/:db/period', bodyParser.json(), checkToken, checkDb, require('./period'));
router.use('/db/:db/account', bodyParser.json(), checkToken, checkDb, require('./account'));
router.use('/db/:db/document', bodyParser.json(), checkToken, checkDb, require('./document'));
router.use('/db/:db/entry', bodyParser.json(), checkToken, checkDb, require('./entry'));
router.use('/db/:db/heading', bodyParser.json(), checkToken, checkDb, require('./heading'));
router.use('/db/:db/tags', bodyParser.json(), checkToken, checkDb, require('./tags'));
router.use('/db/:db/report', bodyParser.json(), checkToken, checkDb, require('./report'));
router.use('/db/:db/settings', bodyParser.json(), checkToken, checkDb, require('./settings'));
router.use('/admin/user', bodyParser.json(), checkAdminToken, require('./user'));
router.use('/db', bodyParser.urlencoded({extended: true}), checkToken, require('./db'));

module.exports = router;
