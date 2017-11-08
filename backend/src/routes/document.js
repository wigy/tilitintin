const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  db.select('*').from('document').orderBy('number').then(
    data => res.send(data.map(e => {
      e.class = 'document';
      e.date = moment(e.date);
      return e;
    }))
  );
});

module.exports = router;
