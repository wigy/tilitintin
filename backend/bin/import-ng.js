#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');

cli.opt('conf', 'default', 'Name of the section to use from the config file.');
cli.opt('dry-run', null, 'To turn dry-run on.');
cli.opt('debug', null, 'To turn dry-run on and display entries.');
cli.opt('no-profit', null, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('force', null, 'Import even if the entries are found already.');
cli.arg_('format', ['kraken', 'coinmotion', 'nordnet', 'gdax']);
cli.arg_('db', knex.dbs());
cli.args('csv-files', 'transaction log as CSV file(s)');

if (cli.options.conf) {
  config.use(cli.options.conf);
}

config.set({
  flags: {
    noProfit: cli.options['no-profit'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    debug: cli.options.debug,
    force: cli.options.force
  }
});

// TODO: Reading default configs from some kind of .env-file.
async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db))
  await fyffe.loadAccounts('tilitintin');
  // TODO: Should load only needed balances and just before the given date in the import data.
  await fyffe.loadBalances('tilitintin');
  if (cli.options.debug) {
    fyffe.ledger.accounts.showBalances('Initial balances:');
  }
  await fyffe.import('tilitintin', cli.format, cli['csv-files']);
  if (cli.options.debug) {
    fyffe.ledger.showTransactions('Transactions:')
    fyffe.ledger.accounts.showBalances('Final balances:');
  }
}

main().catch((err) => console.error(err));
