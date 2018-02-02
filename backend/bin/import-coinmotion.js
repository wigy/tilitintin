#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const importer = require('../src/lib/import/coinmotion');

const DEBUG = false;

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Coinmotion as CSV file');

importer.configure({
  tags: '[CoinM][KRY]',
  accounts: {
    bank: 1778,
    euro: 1930,
    crypto: 1549,
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
