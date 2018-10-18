#!/usr/bin/env node
/**
 * This script scans for trading transactions and adds profits and losses where missing.
 */
const promiseSeq = require('promise-sequential');
const { util: {num, cli} } = require('libfyffe');
const knex = require('../src/lib/knex');

cli.opt('debug', false, 'To turn dry-run on.');
cli.opt('target', 1549, 'Number of an account for storing target amount changes.');
cli.opt('losses', 9750, 'Number of an account for recording losses.');
cli.opt('profits', 3490, 'Number of an account for recording profit.');
cli.opt('fees', 9690, 'Number of an account for trading fees.');
cli.arg_('db', knex.dbs());
cli.arg('target', 'Trading code of the target like ETH or BTC.');

let avgPrice = 0;
let accountIdByNumber = {};

knex.db(cli.db)
  .from('account')
  .select('id', 'number')
  .then((accounts) => accounts.forEach((acc) => accountIdByNumber[acc.number] = acc.id))
.then(() => {
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
      const desc = Description.parse(line.description);
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
      const totalTxFees = entries.filter((e) => e.number === cli.options.fees).reduce((prev, curr) => prev + curr.amount, 0);
      const alreadyDone = entries.filter((e) => e.number === cli.options.losses || e.number === cli.options.profits).length > 0;
      const oldTotal = item.total - item.desc.amount;
      const oldAverage = avgPrice;
      const oldPrice = oldTotal * oldAverage;
      const newPrice = totalTxEuros - totalTxFees;
      const newTotal = item.total;

      if (item.desc.type === 'buy') {
        avgPrice = (oldPrice + newPrice) / newTotal;
        // Check that total and average is correct in description.
        if (Math.abs(item.total - item.desc.total) > num.ACCURACY * 1000 || Math.abs(avgPrice - item.desc.avg) > 0.0099999) {
          item.desc.total = item.total;
          item.desc.setAvg(avgPrice);
          show(item);
          if (cli.options.debug) {
            return;
          }

          // Update all entry texts.
          return knex.db(cli.db)('entry')
            .where({document_id: item.line.id})
            .update({description: item.desc.toString()});
        }
      }
      if (item.desc.type === 'sell') {
        // Calculate profits or losses.
        if (!alreadyDone || Math.abs(item.total - item.desc.total) > num.ACCURACY * 1000 || Math.abs(avgPrice - item.desc.avg) > 0.0099999) {
          item.desc.total = item.total;
          item.desc.setAvg(avgPrice);
          const buyPrice = Math.round(100 * (-item.desc.amount) * avgPrice) / 100;
          const diff = Math.round((totalTxEuros - buyPrice) * 100) / 100;
          show(item);
          if (cli.options.debug) {
            return;
          }

          // Update all entry texts.
          return knex.db(cli.db)('entry')
            .where({document_id: item.line.id})
            .update({description: item.desc.toString()})

          .then(() => {
            // Find the target entry from the transaction.
            const targetEntry = entries.filter((e) => e.number === cli.options.target);
            if (!targetEntry.length) {
              throw new Error('Cannot find target-account from transaction ' + JSON.stringify(entries));
            }
            const targetEntryId = targetEntry[0].id;

            if (diff < 0) {
              // Handle case of losses.

              // Update buy amount
              return knex.db(cli.db)('entry')
                .where({id: targetEntryId})
                .update({amount: buyPrice})
              .then(() => {

                // Insert losses.
                return knex.db(cli.db)('entry')
                  .insert({
                    document_id: item.line.id,
                    account_id: accountIdByNumber[cli.options.losses],
                    debit: 1,
                    amount: Math.round(-diff * 100) / 100,
                    description: item.desc.toString(),
                    row_number: entries.length + 1,
                    flags: 0
                  });
              });
            } else if (diff > 0) {
              // Handle case of profits.
              return knex.db(cli.db)('entry')
                .where({id: targetEntryId})
                .update({amount: buyPrice})
              .then(() => {

                // Insert profit.
                return knex.db(cli.db)('entry')
                  .insert({
                    document_id: item.line.id,
                    account_id: accountIdByNumber[cli.options.profits],
                    debit: 0,
                    amount: diff,
                    description: item.desc.toString(),
                    row_number: entries.length + 1,
                    flags: 0
                  });
              });
            }
          });
        }
      }
    });
  })))
  .then((txs) => promiseSeq(txs))
  .then(() => process.exit())
});


/**
 * A class able to parse descriptions from the transactions.
 */
class Description {

  constructor() {
    // A list of tags in the entry.
    this.tags = [];
    // A text that has replaced notes with `()`, change amount with `+$`, target with `###`,
    // total owned with `+#` and average price with `+$/###`.
    this.text = null;
    // Notes extracted as text.
    this.notes = [];
    // Either 'sell' or 'buy'.
    this.type = null;
    // Code of the trade target.
    this.target = null;
    // Amount of the target traded.
    this.amount = null;
    // Cumulative total of the target.
    this.total = null;
    // Average price after buying or before selling.
    this.avg = null;
  }

  /**
   * Convert back to the description string.
   */
  toString() {
    const tags = this.tags.map((tag) => '[' + tag + ']');
    let notes = this.notes.map((note) =>
      note.replace('+#', num.trim(this.total)).replace('+$/###', num.currency(this.avg))
    );
    let text = this.text.replace('()', '(' + notes.join(', ') + ')');
    if (this.amount !== null) {
      text = text.replace('+$ ###', num.trimSigned(this.amount, this.target));
    }
    return (tags.length ? tags.join('') + ' ' : '') + text;
  }

  /**
   * Update average price.
   */
  setAvg(avg) {
    if (this.avg === null) {
      if (this.type === 'sell') {
        this.notes = ['k.h. +$/### €/' + this.target].concat(this.notes);
      } else {
        this.notes.push('k.h. nyt +$/### €/' + this.target);
      }
    }
    this.avg = avg;
  }

  /**
   * Extract parts of the description text to the `Description` instance.
   * @param {String} text
   * @return {Description}
   */
  static parse(text0) {
    let text = text0;
    let ret = new Description();

    // Extract tags.
    do {
      let match = /^\[([a-zA-Z0-9]+)\]\s*(.*)/.exec(text);
      if (!match) {
        break;
      }
      ret.tags.push(match[1]);
      text = match[2];
    } while(true);

    // Extract notes.
    let sub = /(.*)\((.*)\)(.*)/.exec(text);
    if (sub) {
      text = sub[1] + '()' + sub[3];
      ret.notes = sub[2].split(', ');
    }

    // Extract numbers and target.
    const match = /^(Myynti|Osto) ([-+][0-9.]+) ([A-Z0-9]+)\b(.*)/.exec(text);
    if (!match) {
      throw new Error('Unable to analyze ' + JSON.stringify(text0));
    }
    ret.type = match[1] === 'Myynti' ? 'sell' : 'buy';
    ret.target = match[3];
    ret.amount = parseFloat(match[2]);
    text = match[1] + ' +$ ###' + match[4];
    ret.text = text;

    // Analyse notes.
    ret.notes.forEach((note, idx) => {
      let match = /^(yht\.|jälj\.) ([-0-9.]+)(.*)$/.exec(note);
      if (match) {
        ret.total = parseFloat(match[2]);
        ret.notes[idx] = match[1] + ' +#' + match[3];
      } else {
        match = /^(k\.h\.)( nyt)? ([0-9.,]+) (€\/\w+)$/.exec(note);
        if (match) {
          ret.avg = parseFloat(match[3].replace(/,/g, ''));
          ret.notes[idx] = match[1] + (match[2] || '') + ' +$/### ' + match[4];
        } else {
          throw new Error('Unable to parse note ' + JSON.stringify(note));
        }
      }
    });

    return ret;
  }
}
