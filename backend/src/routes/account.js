const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll('account', null, ['number'])
    .then(data => res.send(data));
});

router.get('/:id', (req, res) => {
  data.getOne('account', req.params.id)
  .then(account => {
    res.send(account);
  });
});

router.get('/:id/:period', (req, res) => {
  data.getOne('account', req.params.id)
  .then(account => {
    data.getAccountTransactions(req.params.id, req.params.period)
      .then(txs => {
        account.transactions = txs;
        res.send(account);
      })
  });
});

module.exports = router;
