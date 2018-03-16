#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');

cli.opt('dry-run', false, 'To turn dry-run on.');
cli.opt('debug', false, 'To turn dry-run on and display entries.');
cli.opt('no-profit', false, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('service', null, 'Name of the service tag if any.');
cli.opt('fund', null, 'Additional fund tag if any.');
cli.opt('bank', 1910, 'Number of an account for banking.');
cli.opt('eur', 1960, 'Number of an account for storing EUR in the service.');
cli.opt('eur-loan', null, 'Number of an account for recording negative EUR account balance as a loan.');
cli.opt('usd', null, 'Number of an account for storing USD in the service.');
cli.opt('shares', 1543, 'Number of an account for storing stock shares.');
cli.opt('eth', 1549, 'Number of an account for storing ETH.');
cli.opt('btc', 1549, 'Number of an account for storing BTC.');
cli.opt('fees', 9690, 'Number of an account for trading fees.');
cli.opt('tax', 9900, 'Number of an account for income taxes.');
cli.opt('src-tax', 9930, 'Number of an account for foreign taxes.');
cli.opt('interest', 9550, 'Number of an account for interest payments.');
cli.opt('rounding', 8570, 'Number of an account for rounding errors.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recording profit.');
cli.opt('dividends', 3470, 'Number of an account for recording dividends.');
cli.arg_('format', ['kraken', 'coinmotion', 'nordnet', 'gdax']);
cli.arg_('db', knex.dbs());
cli.args('csv-files', 'transaction log as CSV file(s)');

config.set({
  service: cli.options.service,
  fund: cli.options.fund,
  flags: {
    noProfit: cli.options['no-profit'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    debug: cli.options.debug,
  },
  accounts: {
    bank: cli.options.bank,
    currencies: {
      eur: cli.options.eur,
      usd: cli.options.usd,
    },
    loans: {
      eur: cli.options['eur-loan'],
    },
    taxes: {
      income: cli.options.tax,
      source: cli.options['src-tax'],
    },
    targets: {
      shares: cli.options.shares,
      eth: cli.options.eth,
      btc: cli.options.btc,
    },
    fees: cli.options.fees,
    interest: cli.options.interest,
    rounding: cli.options.rounding,
    losses: cli.options.losses,
    profits: cli.options.profits,
    dividends: cli.options.dividends
  }
});

async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db))
  await fyffe.loadAccounts('tilitintin');
  await fyffe.loadBalances('tilitintin');
  if (cli.options.debug) {
    fyffe.accounts.showBalances('Initial balances:');
  }
  await fyffe.import(cli.format, cli['csv-files']);
}

main().catch((err) => console.error(err));
