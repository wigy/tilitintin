const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  db.select('*').from('period').then(
    data => res.send(data.map(e => {
      e.start_date = moment(e.start_date);
      e.end_date = moment(e.end_date);
      return e;
    }))
  );
});

module.exports = router;
