#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const importer = require('../src/lib/import/kraken');

const DEBUG = true;

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Kraken as CSV file');

importer.configure({
  tags: '[Kraken][KRY]',
  accounts: {
    bank: 1778,
    euro: 1931,
    crypto: 1549,
    eth: 1548,
    btc: 1547,
    fees: 9690,
    rounding: 8570,
    losses: 9751,
    profits: 3461
  }
});

importer.import(cli.db, cli['csv-file'], DEBUG)
  .then((num) => console.log('Created', num, 'entries.'))
  .catch((err) => console.error(err));
