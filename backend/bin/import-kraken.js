#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const kraken = require('../src/lib/import/kraken');

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Kraken as CSV file');

kraken.configure({
  bankAccount: 1910,
  euroAccount: 1931,
  cryptoAccount: 1549,
  ethAccount: 1548,
  btcAccount: 1547,
  roundingAccount: 8570
});

kraken.import(cli.db, cli['csv-file'])
  .catch((err) => {
    console.error(err);
  });
