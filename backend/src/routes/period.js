const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'period', null, ['start_date', 'desc'])
    .then(periods => res.send(periods));
});

router.get('/:id', (req, res) => {
  data.getPeriodBalances(req.db, req.params.id)
    .then(balances => {
      res.send(balances);
    });
});

router.post('/', async (req, res) => {
  return data.createOne(req.db, 'period', req.body)
    .then((data) => res.send(data));
});

router.patch('/:id', (req, res) => {
  let obj = req.body;
  data.updateOne(req.db, 'period', req.params.id, obj)
    .then((code) => res.status(code).send());
});

module.exports = router;
