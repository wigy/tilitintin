const express = require('express');
const router = express.Router();
const data = require('libfyffe').data.tilitintin.data;
const knex = require('../lib/knex');

router.get('/',
  async (req, res) => {
    data.listAll(knex.db(req.db), 'period', null, ['start_date', 'desc'])
      .then(periods => res.send(periods));
  });

router.get('/:id',
  async (req, res) => {
    data.getPeriodBalances(knex.db(req.db), req.params.id)
      .then(balances => {
        res.send(balances);
      });
  });

router.post('/', async (req, res) => {
  return data.createOne(knex.db(req.db), 'period', req.body)
    .then((data) => res.send(data));
});

router.patch('/:id',
  async (req, res) => {
    const obj = req.body;
    data.updateOne(knex.db(req.db), 'period', req.params.id, obj)
      .then((code) => res.status(code).send());
  });

module.exports = router;
