#!/usr/bin/env node
const sprintf = require('sprintf');
const knex = require('../src/lib/knex');
const { config, util: {cli} } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';
const tilitintinTx = require('libfyffe').data.tilitintin.tx;

knex.setUser(USER);

cli.arg_('db', knex.dbs(USER));
cli.arg_('operation', ['add']);
cli.arg('text', 'new-line separated string of entries as `2019-01-01 1234 -12.34 Description here\\n1234 12.34 Description here`');

config.loadIni();
const db = knex.db(cli.db);

async function main() {
  const text = cli.text.trim().replace(/\\n/g, '\n'); // Handle also literal \n as new line.
  const entries = [];
  let date;
  for (const line of text.split('\n')) {
    const [, date_, account, amount, description] = /^\s*(?:(\d\d\d\d-\d\d-\d\d|\d\d?\.\d\d?\.\d\d\d\d)\s+)?(\d+)\s+(-?[0-9.]+)\s+(.*?)\s*$/.exec(line);
    if (/^\d\d?\.\d\d?\.\d\d\d\d$/.test(date_)) {
      const [, d, m, y] = /^(\d\d?)\.(\d\d?)\.(\d\d\d\d)$/.exec(date_);
      date = sprintf('%04d-%02d-%02d', parseInt(y), parseInt(m), parseInt(d));
    }
    entries.push({
      number: account,
      amount: parseFloat(amount),
      description
    });
    date = date || date_;
  }
  await tilitintinTx.add(db, date, null, entries);
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
