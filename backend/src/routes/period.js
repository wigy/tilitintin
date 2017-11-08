const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const data = require('../lib/data');

router.get('/', (req, res) => {
  db.select('*').from('period').orderBy('start_date', 'desc').then(
    entries => res.send(data.api(entries, 'period'))
  );
});

router.get('/:period', (req, res) => {
  const {period} = req.params;
  db.select('*').from('document').where({period_id: period}).then(
    entries => res.send(data.api(entries, 'document'))
  );
});

module.exports = router;
