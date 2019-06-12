const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'account', null, ['number'])
    .then(data => res.send(data));
});

router.get('/:id', async (req, res) => {
  const periods = await data.getAccountTransactionCountByPeriod(req.db, req.params.id);
  data.getOne(req.db, 'account', req.params.id)
    .then(account => {
      if (!account) {
        res.sendStatus(404);
        return;
      }
      account.periods = periods;
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

router.post('/', async (req, res) => {
  let obj = req.body;
  data.createOne(req.db, 'account', obj)
    .then(entry => entry ? res.send(entry) : res.sendStatus(400));
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const periods = await data.getAccountTransactionCountByPeriod(req.db, id);
  let locked = false;
  periods.forEach(async (period) => {
    if (period.entries || period.locked) {
      locked = true;
    }
  });
  if (locked) {
    res.sendStatus(403);
  } else {
    await data.deleteOne(req.db, 'account', id);
    res.sendStatus(204);
  }
});

module.exports = router;
