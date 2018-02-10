#!/usr/bin/env node
/**
 * This script scans for trading transactions and adds profits and losses where missing.
 */
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');

cli.opt('debug', false, 'To turn dry-run on.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recoring profit.');
cli.arg_('db', knex.dbs());
cli.arg_('account', 'The account number to scan.');
cli.arg('target', 'Trading code of the target like ETH or BTC.');

const Import = require('../src/lib/import/base');
const importer = new Import();
importer.configure({
  service: cli.options.service,
  fund: cli.options.fund,
  accounts: {
    losses: cli.options.losses,
    profits: cli.options.profits
  }
});
