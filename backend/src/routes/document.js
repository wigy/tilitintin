const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const data = require('../lib/data');

router.get('/', (req, res) => {
  db.select('*').from('document').orderBy('number').then(
    entries => res.send(data.api(entries, 'document'))
  );
});

router.get('/:document', (req, res) => {
  const {document} = req.params;
  db.select('entry.*', 'document.date').from('document').where({'document.id': document}).leftJoin('entry', 'document.id', 'entry.document_id').orderBy('row_number').then(
    // TODO: Change this logic: read single entry first, then add linked items under `entries`.
    entries => res.send(data.api(entries, 'entry', 'document'))
  );
});

module.exports = router;
