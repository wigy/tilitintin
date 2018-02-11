#!/usr/bin/env node
/**
 * This script scans for trading transactions and adds profits and losses where missing.
 */
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const text = require('../src/lib/text');

cli.opt('debug', false, 'To turn dry-run on.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recoring profit.');
cli.arg_('db', knex.dbs());
cli.arg('target', 'Trading code of the target like ETH or BTC.');

knex.db(cli.db)
  .from('document')
  .select('document.id', 'document.number', 'entry.description')
  .sum('amount AS total')
  .leftJoin('entry', 'entry.document_id', 'document.id')
  .leftJoin('account', 'entry.account_id', 'account.id')
  .leftJoin('period', 'document.period_id', 'period.id')
  .where('entry.debit', '=', 1)
  .where('entry.description', 'like', '% ' + cli.target + ' %')
  .orderBy(['period.start_date', 'document.date', 'entry.row_number'])
  .groupBy('document.number')
  .then((data) => {
    let total = 0;
    return data.map((line) => {
      console.log('\u001b[33;1m', line.number, line.description, '\u001b[0m');
      const desc = text.parse(line.description);
      switch (desc.type) {
        case 'buy':
          total += desc.amount;
          break;
        case 'sell':
          total += desc.amount;
          break;
        default:
          throw new Error('No handler for type ' + desc.type);
      }
      return {desc, total, line};
    });
  })
  .then((data) => {
    console.log(data);
  });
