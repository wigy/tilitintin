#!/usr/bin/env node
/**
 * This script clears a single account.
 */
const promiseSeq = require('promise-sequential');
const knex = require('../src/lib/knex');
const cli = require('../src/lib/cli');

cli.arg_('db', knex.dbs());
cli.arg_('period', 'period ID');
cli.arg('account', 'account number');

let killEntries, killDocs;

knex.db(cli.db)
  .from('document')
  .select('document.id', 'document.number')
  .leftJoin('entry', 'entry.document_id', 'document.id')
  .leftJoin('account', 'entry.account_id', 'account.id')
  .where('account.number', '=', cli.account)
  .where('document.period_id', '=', cli.period)
  .then((data) => {
    console.log('Dropping documents', data.map((d) => d.number).join(', '));
    killEntries = data.map((d) => () => knex.db(cli.db)('entry').where({document_id: d.id}).delete());
    killDocs = data.map((d) => () => knex.db(cli.db)('document').where({id: d.id}).delete());
    return [killEntries, killDocs];
  })
  .then(() => promiseSeq(killEntries))
  .then(() => promiseSeq(killDocs));
