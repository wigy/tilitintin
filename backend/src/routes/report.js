const express = require('express');
const moment = require('moment');
const dump = require('neat-dump');
const router = express.Router();
const reports = require('../lib/reports');
const data = require('../lib/data');
const conversions = require('../lib/conversions');
const knex = require('../lib/knex');
const config = require('../config');

// Helper to collect report options.
const options = () => {
  const options = {};
  reports.customReports().map((report) => (options[report.id] = report.options || {}));
  reports.standardOptions().map((report) => (options[report.id] = report.options || {}));
  return options;
};

router.get('/', (req, res) => {
  let links = {};
  data.listAll(req.db, 'report_structure', null, ['id'])
    .then((results) => {
      results = reports.customReports().concat(results);
      results.forEach((report) => (links[report.id] = config.BASEURL + '/db/' + req.db + '/report/' + report.id));
      res.send({links, options: options()});
    });
});

router.get('/:format', (req, res) => {
  const {format} = req.params;
  let links = {};

  // TODO: Dates correct?
  const dateRange = period => moment(period.start_date).format('YYYY-MM-DD') + ' ' + moment(period.end_date).format('YYYY-MM-DD');
  data.listAll(req.db, 'period', null, ['start_date', 'desc'])
    .then(periods => {
      periods.forEach((period) => (links[dateRange(period)] = config.BASEURL + '/db/' + req.db + '/report/' + format + '/' + period.id));
      res.send({links, options: options()});
    });
});

router.get('/:format/:period', (req, res) => {
  const {format, period} = req.params;
  const periodId = parseInt(period);
  let periods = [periodId];

  // Construct query options.
  const query = {
    lang: req.query.lang || 'en'
  };
  const params = options()[format] || {};
  Object.keys(params).forEach((key) => {
    if (key in req.query) {
      try {
        query[key] = JSON.parse(req.query[key]);
      } catch (err) {
        dump.error('Invalid parameter', key, '=', req.query[key]);
      }
    }
  });

  // Set up converter.
  let convert = conversions.identical;
  if ('csv' in req.query) {
    convert = conversions.csv;
    res.setHeader('Content-Disposition', `attachment; filename=${format}.csv`);
    res.setHeader('Content-Type', 'application/csv');
  }

  knex.db(req.db).select('*').from('period').where('id', '<', periodId).orderBy('end_date', 'desc').first()
    .then(prev => {
      const special = reports.customReports().filter((report) => report.id === format);

      if (prev && !special.length && !query.byTags) {
        periods.push(prev.id);
      }

      if (special.length) {
        reports.create(req.db, periods, format, special[0].data, query)
          .then((report) => {
            res.send(convert(report));
          });
        return;
      }

      data.getOne(req.db, 'report_structure', format)
        .then((reportStructure) => reports.create(req.db, periods, format, reportStructure.data, query))
        .then((report) => {
          res.send(convert(report, query));
        });
    });
});

module.exports = router;
