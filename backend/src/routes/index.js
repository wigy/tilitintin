const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('../config');
const knex = require('../lib/knex');

router.post('/auth', (req, res) => {
  const {user, password} = req.body;
  if (user === config.TILITIN_USER && password === config.TILITIN_PASSWORD) {
    const token = jwt.sign({service: 'Tilitintin', user: user}, config.SECRET);
    res.send({token: token});
  } else {
    res.status(401).send('Invalid user or password.');
  }
});

function checkToken(req, res, next) {
  if (!config.AUTHENTICATION) {
    next();
    return;
  }
  const auth = req.headers.authorization;
  if (auth) {
    if (auth.substr(0, 7) === 'Bearer ') {
      let token = auth.substr(7, auth.length - 7);
      jwt.verify(token, config.SECRET, (err, decoded) => {
        if (err || decoded.service !== 'Tilitintin') {
          res.status(403).send('Unauthorized.');
        } else {
          next();
        }
      });
      return;
    }
  }
  res.status(403).send('Unauthorized.');
}

router.get('/', checkToken, (req, res) => {
  res.send({
    links: {
      databases: config.BASEURL + '/db'
    }});
});

router.get('/db/', checkToken, (req, res) => {
  res.send(knex.dbs().map(db => {
    return {name: db, links: {view: config.BASEURL + '/db/' + db}};
  }));
});

function checkDb(req, res, next) {
  const {db} = req.params;
  if (!knex.isdb(db)) {
    res.status(404).send('Database not found.');
  } else {
    req.db = db;
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

module.exports = router;
