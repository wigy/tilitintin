#!/usr/bin/env node
const dump = require('neat-dump');
const knex = require('../src/lib/knex');
const { config, util: { cli, num }, core: { fyffe } } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';

knex.setUser(USER);

cli.opt('config', null, 'Load the given config file instead of default.');

cli.arg_('db', knex.dbs(USER));
cli.arg('service', 'service name');

config.loadIni(cli.options.config || null);

async function main() {
  const date = null;
  fyffe.setDb('tilitintin', knex.db(cli.db));
  await fyffe.loadTags('tilitintin');
  await fyffe.loadAccounts('tilitintin');
  await fyffe.initializeStock('tilitintin', date, null);

  const service = new RegExp('^' + cli.service.toUpperCase() + ':');
  let total = 0;
  for (const ticker of fyffe.stock.list().filter(sym => service.test(sym))) {
    const avg = fyffe.stock.getAverage(ticker);
    const count = fyffe.stock.getStock(ticker);
    const value = count * avg;
    total += value;
    dump.green(`${ticker}`);
    dump.yellow(`    ${count} x ${num.currency(avg, '€')}`);
    dump.purple(`    ${num.currency(value, '€')}`);
  }

  dump.green('Total:');
  dump.purple(`    ${num.currency(total, '€')}`);
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
