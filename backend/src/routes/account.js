const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  db.select('*').from('account').orderBy('number').then(
    data => res.send(data.map(e => {
      e.class = 'account';
      return e;
    }))
  );
});

module.exports = router;
