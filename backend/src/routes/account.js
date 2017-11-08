const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const data = require('../lib/data');

router.get('/', (req, res) => {
  db.select('*').from('account').orderBy('number').then(
    entries => res.send(data.api(entries, 'account'))
  );
});

module.exports = router;
