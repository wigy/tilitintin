const express = require('express');
const router = express.Router();
const data = require('../lib/data');
const db = require('../lib/db');

router.get('/', (req, res) => {
  data.listAll('period', null, ['start_date', 'desc'])
    .then(periods => res.send(periods));
});

router.get('/:id', (req, res) => {
  data.getPeriodBalances(req.params.id)
    .then(balances => {
      res.send(balances);
    });
});

module.exports = router;
