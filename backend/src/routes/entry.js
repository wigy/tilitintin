const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'entry', null, ['id'])
    .then(entries => res.send(entries));
});

router.post('/', (req, res) => {
  data.createOne(req.db, 'entry', req.body)
    .then(entry => entry ? res.send(entry) : res.sendStatus(400));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'entry', req.params.id)
    .then(entry => res.send(entry));
});

router.patch('/:id', (req, res) => {
  let obj = req.body;
  if ('amount' in obj) {
    obj.amount /= 100;
  }
  data.updateOne(req.db, 'entry', req.params.id, obj)
    .then((code) => res.status(code).send());
});

module.exports = router;
