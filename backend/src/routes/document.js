const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'document', null, ['number'])
    .then(documents => res.send(documents));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'document', req.params.id, 'entry', ['row_number'])
    .then(document => res.send(document));
});

module.exports = router;
