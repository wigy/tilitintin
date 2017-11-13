const express = require('express');
const router = express.Router();
const config = require('../config');
const knex = require('../lib/knex');

router.get('/', (req, res) => {
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

router.get('/:db', checkDb, (req, res) => {
  const {db} = req.params;
  res.send({
    links: {
      periods: config.BASEURL + '/' + db + '/period',
      accounts: config.BASEURL + '/' + db + '/account',
      documents: config.BASEURL + '/' + db + '/document',
      entries: config.BASEURL + '/' + db + '/entry',
  }});
});

router.use('/:db/period', checkDb, require('./period'));
router.use('/:db/account', checkDb, require('./account'));
router.use('/:db/document', checkDb, require('./document'));
router.use('/:db/entry', checkDb, require('./entry'));

module.exports = router;
