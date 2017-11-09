const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll('document', null, ['number'])
    .then(data => res.send(data));
});

router.get('/:id', (req, res) => {
  data.getOne('document', req.params.id, 'entry', ['row_number'])
    .then(data => res.send(data));
});

module.exports = router;
