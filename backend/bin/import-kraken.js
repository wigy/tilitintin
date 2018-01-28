#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const kraken = require('../src/lib/import/kraken');

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Kraken as CSV file');

kraken.configure({
  accounts: {
    bank: 1910,
    euro: 1931,
    crypto: 1549,
    eth: 1548,
    btc: 1547,
    rounding: 8570
  }
});

kraken.import(cli.db, cli['csv-file'])
  .then((txs) => console.log(txs))
  .catch((err) => console.error(err));
