#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const kraken = require('../src/lib/import/kraken');

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Kraken as CSV file');

kraken.configure({
  tags: '[Kraken][KRY]',
  accounts: {
    bank: 1910,
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

kraken.import(cli.db, cli['csv-file'])
  .then((txs) => {
    if (1) {
      return;
    }
    txs.forEach((item) => {
      console.log('');
      console.log(item.src);
      console.log('');
      console.log('=>', item.tx);
      console.log('');
    });
  })
  .catch((err) => console.error(err));
