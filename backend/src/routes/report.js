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
      reports.forEach((report) => (links[report.id] = config.BASEURL + '/db/' + req.db + '/report/' + report.id));
      res.send({links});
    });
});

router.get('/:format', (req, res) => {
  const {format} = req.params;
  let links = {};

  const dateRange = period => moment(period.start_date).format('YYYY-MM-DD') + ' ' + period.end_date.format('YYYY-MM-DD');

  data.listAll(req.db, 'period', null, ['start_date', 'desc'])
    .then(periods => {
      periods.forEach((period) => (links[dateRange(period)] = config.BASEURL + '/db/' + req.db + '/report/' + format + '/' + period.id));
      res.send({links});
    });
});

router.get('/:format/:period', (req, res) => {
  const {format, period} = req.params;
  let periods = [parseInt(period)]; // TODO: Resolve correctness and only for certain reports if previous exists.
  if (parseInt(period)) {
    periods.push(parseInt(period) - 1);
  }
  data.getOne(req.db, 'report_structure', format)
    .then((reportStructure) => reports.create(req.db, periods, format, reportStructure.data))
    .then((report) => res.send(report));
});

module.exports = router;
