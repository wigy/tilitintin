#!/usr/bin/env node
const knex = require('../src/lib/knex');
const data = require('../src/lib/data');
const { util: { cli} } = require('libfyffe');

cli.arg('db', knex.dbs());

data.listAll(cli.db, 'period', null, ['id'])
  .then((periods) => periods.map(period => period.id))
  .then((ids) => {
    cli.arg('period', ids);
    if (cli.argc() === 2) {
      data.getPeriodBalances(cli.db, cli.period)
      .then((data) => {
        data.balances.forEach((line) => {
          console.log(line.number, line.name);
          console.log('    ', (line.total / 100) + '€');
        });
      });
    } else {
      data.getPeriodAccounts(cli.db, cli.period)
      .then((accounts) => accounts.map(account => account.number))
      .then((accountNumbers) => {
        cli.arg('account', accountNumbers);
        data.getAccountTransactionsByNumber(cli.db, cli.period, cli.account)
          .then((txs) => {
            txs.forEach((tx) => {
              console.log((tx.debit ? '' : '-') + (tx.amount/100) + '€', "\t", tx.description);
            });
          });
      });
    }
  });
