#!/usr/bin/env node
/**
 * This script scans for trading transactions and adds profits and losses where missing.
 */
const promiseSeq = require('promise-sequential');
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const text = require('../src/lib/text');
const num = require('../src/lib/num');

cli.opt('debug', false, 'To turn dry-run on.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recoring profit.');
cli.arg_('db', knex.dbs());
cli.arg('target', 'Trading code of the target like ETH or BTC.');

let avgPrice = 0;

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
    // Calculate totals and construct data for each entry.
    let total = 0;
    return data.map((line) => {
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
  .then((data) => data.map((item) => (() => {

    const show = (item) => {
      console.log('\u001b[33;1m', item.line.number, '\t', item.line.description, '\u001b[0m');
      console.log('    => \u001b[33m\t', item.desc.toString(), '\u001b[0m');
    };

    // Handle each document.
    return knex.db(cli.db)
      .from('entry')
      .select('entry.id', 'account.number', 'entry.amount', 'entry.debit')
      .where('entry.document_id', '=', item.line.id)
      .leftJoin('account', 'entry.account_id', 'account.id')
    .then((entries) => {
      // Check out each entry and maintain totals.
      const totalTxEuros = entries.filter((e) => !e.debit).reduce((prev, curr) => prev + curr.amount, 0);
      const alreadyDone = entries.filter((e) => e.number === cli.options.losses || e.number === cli.options.profits).length > 0;
      const oldTotal = item.total - item.desc.amount;
      const oldAverage = avgPrice;
      const oldPrice = oldTotal * oldAverage;
      const newPrice = totalTxEuros;
      const newTotal = item.total;

      if (item.desc.type === 'buy') {
        avgPrice = (oldPrice + newPrice) / newTotal;
        // Check that total is correct in description.
        if (Math.abs(item.total - item.desc.total) > num.ACCURACY || Math.abs(avgPrice - item.desc.avg) > 0.0099999) {
          item.desc.total = item.total;
          item.desc.setAvg(avgPrice);
          show(item);
          return knex.db(cli.db)('entry')
            .where({document_id: item.line.id})
            .update({description: item.desc.toString()});
        }
      }
      if (item.desc.type === 'sell') {
        // Calculate profits or losses.
        if (!alreadyDone || Math.abs(item.total - item.desc.total) > num.ACCURACY || Math.abs(avgPrice - item.desc.avg) > 0.0099999) {
          item.desc.total = item.total;
          item.desc.setAvg(avgPrice);
          show(item);
          return knex.db(cli.db)('entry')
            .where({document_id: item.line.id})
            .update({description: item.desc.toString()});
          // TODO: Insert profit/losses.
        }
      }
    });
  })))
  .then((txs) => promiseSeq(txs));
