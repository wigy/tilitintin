const express = require('express');
const moment = require('moment');
const router = express.Router();
const reports = require('../lib/reports');
const data = require('../lib/data');
const config = require('../config');

router.get('/', (req, res) => {
  let links = {};
  Object.keys(reports.formats).forEach((name) => links[name] = config.BASEURL + '/db/' + req.db + '/report/' + name);
  res.send({links});
});

router.get('/:format', (req, res) => {
  const {format} = req.params;
  let links = {};

  data.listAll(req.db, 'period', null, ['start_date', 'desc'])
    .then(periods => {
      periods.forEach((period) => links[
        moment(period.start_date).format('YYYY-MM-DD') + ' ' + period.end_date.format('YYYY-MM-DD')
      ] = config.BASEURL + '/db/' + req.db + '/report/' + format + '/' + period.id);
      res.send({links});
    });
});

router.get('/:format/:period', (req, res) => {
  const {format, period} = req.params;
  res.send(reports.create(req.db, parseInt(period), format));
});

module.exports = router;
