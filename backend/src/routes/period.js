const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  db.select('*').from('period').orderBy('start_date', 'desc').then(
    data => res.send(data.map(e => {
      e.start_date = moment(e.start_date);
      e.end_date = moment(e.end_date);
      e.class = 'period';
      return e;
    }))
  );
});

router.get('/:period', (req, res) => {
  const {period} = req.params;
  db.select('*').from('document').where({period_id: period}).then(
    data => res.send(data.map(e => {
      e.date = moment(e.date);
      e.class = 'document';
      return e;
    }))
  );
});

module.exports = router;
