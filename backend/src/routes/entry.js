const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  db.select('*').from('entry').orderBy('id').then(
    data => res.send(data.map(e => {
      e.class = 'entry';
      return e;
    }))
  );
});

module.exports = router;
