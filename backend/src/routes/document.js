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
});

module.exports = router;
