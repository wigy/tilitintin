#!/usr/bin/env node

const knex = require('../src/lib/knex');
const data = require('../src/lib/data');
const cli = require('../src/lib/cli');

cli.arg('db', knex.dbs());

data.listAll(cli.db, 'period', null, ['id'])
  .then((periods) => periods.map(period => period.id))
  .then((ids) => {
    cli.arg('period', ids);
    data.getPeriodBalances(cli.db, cli.period)
      .then((data) => {
        data.balances.forEach((line) => {
          console.log(line.number, line.name);
          console.log('    ', (line.total / 100) + '€');
        });
      });
  });
