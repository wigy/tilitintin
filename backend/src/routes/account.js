const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'account', null, ['number'])
    .then(data => res.send(data));
});

router.get('/:id', async (req, res) => {
  data.getOne(req.db, 'account', req.params.id)
    .then(account => {
      res.send(account);
    });
});

router.get('/:id/:period', (req, res) => {
  data.getOne(req.db, 'account', req.params.id)
    .then(account => {
      data.getAccountTransactionsWithEntries(req.db, req.params.period, req.params.id)
        .then(txs => {
          account.transactions = txs;
          res.send(account);
        });
    });
});

router.patch('/:id', async (req, res) => {
  let obj = req.body;
  data.updateOne(req.db, 'account', req.params.id, obj)
    .then((code) => res.status(code).send());
});

module.exports = router;
