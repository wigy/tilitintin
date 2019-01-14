const express = require('express');
const moment = require('moment');
const router = express.Router();
const reports = require('../lib/reports');
const data = require('../lib/data');
const conversions = require('../lib/conversions');
const knex = require('../lib/knex');
const config = require('../config');

router.get('/', (req, res) => {
  let links = {};
  data.listAll(req.db, 'report_structure', null, ['id'])
    .then((results) => {
      results = reports.customReports().concat(results);
      results.forEach((report) => (links[report.id] = config.BASEURL + '/db/' + req.db + '/report/' + report.id));
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
  const periodId = parseInt(period);
  let periods = [periodId];

  let convert = conversions.identical;
  let contentType = 'application/json';
  if ('csv' in req.query) {
    convert = conversions.csv;
    contentType = 'text/csv';
  }

  knex.db(req.db).select('*').from('period').where('id', '<', periodId).orderBy('end_date', 'desc').first()
    .then(prev => {
      const special = reports.customReports().filter((report) => report.id === format);

      if (prev && !special.length) {
        periods.push(prev.id);
      }

      if (special.length) {
        reports.create(req.db, periods, format, special[0].data)
          .then((report) => res.send(report));
        return;
      }

      data.getOne(req.db, 'report_structure', format)
        .then((reportStructure) => reports.create(req.db, periods, format, reportStructure.data))
        .then((report) => {
          res.setHeader('Content-Type', contentType);
          res.send(convert(report));
        });
    });
});

module.exports = router;
