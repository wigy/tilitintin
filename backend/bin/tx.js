#!/usr/bin/env node
/**
 * This script adds transaction.
 */
const knex = require('../src/lib/knex');
const tx = require('../src/lib/tx');
const { util: { cli} } = require('libfyffe');

cli.arg_('db', knex.dbs());
cli.arg_('date', 'date as YYYY-MM-DD');
cli.arg_('credit', 'an account number of credit side');
cli.arg_('debit', 'an account number of debit side');
cli.arg_('desc', 'transaction description');
cli.arg('amount', 'transaction amount');

const amount = parseFloat(cli.amount);

tx.add(cli.db, cli.date, cli.desc, [{number: cli.credit, amount: -amount}, {number: cli.debit, amount: amount}])
  .catch((err) => {
    console.log(err);
  });
