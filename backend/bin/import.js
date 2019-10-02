#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';

knex.setUser(USER);

cli.opt('avg', null, 'Set explicit averages `SERVICE1:ETH=123,SERVICE2:ETH=122`.');
cli.opt('debug', null, 'To turn dry-run on and display entries.');
cli.opt('debug-stock', null, 'Display stock and average changes in detail.');
cli.opt('dry-run', null, 'To turn dry-run on.');
cli.opt('force', null, 'Import even if the entries are found already.');
cli.opt('no-profit', null, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('trade-profit', null, 'Turn on profit and losses calculations on every trade (needs Harvest).');
cli.opt('service', null, 'Set explicit name for the service instead of the automatic recognition.');
cli.opt('show-stock', null, 'Display stock before and after.');
cli.opt('show-balances', null, 'Display account balances before and after.');
cli.opt('start-date', null, 'Ignore all transactions before this date.');
cli.opt('skip-errors', null, 'If import fails, just print and skip the failed transaction.');
cli.opt('stop-on-error', null, 'If import fails, stop there but continue with successful entries.');
cli.opt('import-errors', null, 'If import fails, create move transaction to imbalance account.');
cli.opt('stock', null, 'Set explicit stocks `SERVICE1:ETH=0.12,SERVICE2:ETH=1.22`.');
cli.opt('zero-moves', null, 'Do not add to the stock commodities moved in.');
cli.arg_('db', knex.dbs(USER));
cli.args('csv-files', 'transaction log as CSV file(s)');

config.loadIni();

config.set({
  flags: {
    debug: cli.options.debug,
    debugStock: cli.options['debug-stock'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    force: cli.options.force,
    noProfit: cli.options['no-profit'],
    tradeProfit: cli.options['trade-profit'],
    showBalances: cli.options['show-balances'],
    showStock: cli.options['show-stock'],
    startDate: cli.options['start-date'],
    skipErrors: cli.options['skip-errors'],
    stopOnError: cli.options['stop-on-error'],
    zeroMoves: cli.options['zero-moves'],
    importErrors: cli.options['import-errors']
  }
});

let avg = {};
let stock = {};

if (cli.options.avg) {
  cli.options.avg.split(',').forEach((str) => {
    const eq = str.split('=');
    avg = avg || {};
    avg[eq[0]] = parseFloat(eq[1]);
  });
}
if (cli.options.stock) {
  cli.options.stock.split(',').forEach((str) => {
    const eq = str.split('=');
    stock = stock || {};
    stock[eq[0]] = parseFloat(eq[1]);
  });
}

async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db));
  fyffe.setAverages(avg);
  fyffe.setStock(stock);
  await fyffe.import(cli['csv-files'], {dbName: 'tilitintin', service: cli.options.service});
  await fyffe.export('tilitintin', {dbName: 'tilitintin'});
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
