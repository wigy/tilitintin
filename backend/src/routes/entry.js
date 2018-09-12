const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'entry', null, ['id'])
    .then(entries => res.send(entries));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'entry', req.params.id)
    .then(entry => res.send(entry));
});

router.patch('/:id', (req, res) => {
  res.send('{"TODO":999}')
});

module.exports = router;
