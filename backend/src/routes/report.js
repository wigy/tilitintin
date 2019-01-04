const express = require('express');
const moment = require('moment');
const router = express.Router();
const reports = require('../lib/reports');
const data = require('../lib/data');
const config = require('../config');

router.get('/', (req, res) => {
  let links = {};
  data.listAll(req.db, 'report_structure', null, ['id'])
    .then((reports) => {
      reports.forEach((report) => links[report.id] = config.BASEURL + '/db/' + req.db + '/report/' + report.id);
      res.send({links});
    });
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
  data.getOne(req.db, 'report_structure', format)
  .then(a => {
    console.log(a.id, a.data.length); return a;
  })
    .then((reportStructure) => reports.create(req.db, parseInt(period), reportStructure.data))
    .then((report) => res.send(report));
});

module.exports = router;
