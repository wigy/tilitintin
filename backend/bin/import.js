#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');

cli.opt('debug', false, 'To turn dry-run on.');
cli.opt('noprofit', false, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('service', null, 'Name of the service tag if any.');
cli.opt('fund', null, 'Additional fund tag if any.');
cli.opt('bank', 1910, 'Number of an account for banking.');
cli.opt('eur', 1960, 'Number of an account for storing EUR in the service.');
cli.opt('usd', null, 'Number of an account for storing USD in the service.');
cli.opt('shares', 1543, 'Number of an account for storing stock shares.');
cli.opt('crypto', 1549, 'Number of an account for storing crypto currencies.');
cli.opt('eth', null, 'Number of an account for storing ETH.');
cli.opt('btc', null, 'Number of an account for storing BTC.');
cli.opt('fees', 9690, 'Number of an account for trading fees.');
cli.opt('interest', 9550, 'Number of an account for interest payments.');
cli.opt('rounding', 8570, 'Number of an account for rounding errors.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recoring profit.');
cli.arg_('format', ['kraken', 'coinmotion', 'nordnet']);
cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log as CSV file');

const importer = require('../src/lib/import/' + cli.format);
importer.configure({
  service: cli.options.service,
  fund: cli.options.fund,
  noProfit: cli.options.noprofit,
  accounts: {
    bank: cli.options.bank,
    eur: cli.options.eur,
    usd: cli.options.usd,
    crypto: cli.options.crypto,
    shares: cli.options.shares,
    eth: cli.options.eth,
    btc: cli.options.btc,
    fees: cli.options.fees,
    interest: cli.options.interest,
    rounding: cli.options.rounding,
    losses: cli.options.losses,
    profits: cli.options.profits
  }
});

importer.import(cli.db, cli['csv-file'], cli.options.debug)
  .catch((err) => console.error(err));
