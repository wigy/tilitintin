#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: { cli }, core: { fyffe } } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';

knex.setUser(USER);

cli.opt('add-currencies', null, 'Add converted foreign currency amounts, where applicable.');
cli.opt('avg', null, 'Set explicit averages `SERVICE1:ETH=123,SERVICE2:ETH=122`.');
cli.opt('config', null, 'Load the given config file instead of default.');
cli.opt('debug-stock', null, 'Display stock and average changes in detail.');
cli.opt('debug', null, 'To turn dry-run on and display entries.');
cli.opt('dry-run', null, 'To turn dry-run on.');
cli.opt('encoding', null, 'Force encoding of import files.');
cli.opt('end-date', null, 'Ignore all transactions after this date.');
cli.opt('force', null, 'Import even if the entries are found already.');
cli.opt('fallback', null, 'Set name for the fallback service to query prices.');
cli.opt('fund', null, 'Set name for the fund.');
cli.opt('import-errors', null, 'If import fails, create move transaction to imbalance account.');
cli.opt('no-deposit', null, 'Ignore deposit transactions.');
cli.opt('no-profit', null, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('no-withdrawal', null, 'Ignore withdrawal transactions.');
cli.opt('service', null, 'Set name for the service.');
cli.opt('show-balances', null, 'Display account balances before and after.');
cli.opt('show-stock', null, 'Display stock before and after.');
cli.opt('short-sell', null, 'Allow short selling.');
cli.opt('simple', null, 'Use simplified import.');
cli.opt('single-loan-update', null, 'Add loan update only at the end of the import.');
cli.opt('skip-errors', null, 'If import fails, just print and skip the failed transaction.');
cli.opt('start-date', null, 'Ignore all transactions before this date.');
cli.opt('stock', null, 'Set explicit stocks `SERVICE1:ETH=0.12,SERVICE2:ETH=1.22`.');
cli.opt('stop-on-error', null, 'If import fails, stop there but continue with successful entries.');
cli.opt('trade-profit', null, 'Turn on profit and losses calculations on every trade (needs Harvest).');
cli.opt('zero-moves', null, 'Do not add to the stock commodities moved in.');

cli.arg_('db', knex.dbs(USER));
cli.args('csv-files', 'transaction log as CSV file(s)');

config.loadIni(cli.options.config || null);

config.set({
  encoding: cli.options.encoding,
  fallbackService: cli.options.fallback || null,
  flags: {
    addCurrencies: cli.options['add-currencies'],
    debug: cli.options.debug,
    debugStock: cli.options['debug-stock'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    force: cli.options.force,
    noProfit: cli.options['no-profit'],
    tradeProfit: cli.options['trade-profit'],
    showBalances: cli.options['show-balances'],
    showStock: cli.options['show-stock'],
    shortSell: cli.options['short-sell'],
    simple: cli.options.simple,
    singleLoanUpdate: cli.options['single-loan-update'],
    skipErrors: cli.options['skip-errors'],
    stopOnError: cli.options['stop-on-error'],
    zeroMoves: cli.options['zero-moves'],
    importErrors: cli.options['import-errors']
  },
  endDate: cli.options['end-date'],
  startDate: cli.options['start-date']
});

let avg = {};
let stock = {};
const ignore = new Set();

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
if (cli.options['no-withdrawal']) {
  ignore.add('withdrawal');
}
if (cli.options['no-deposit']) {
  ignore.add('deposit');
}

if (!cli.options.simple && !cli.options.service) {
  throw new Error('Option --service is required.');
}
if (!cli.options.simple && !cli.options.fund) {
  throw new Error('Option --fund is required.');
}

async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db));
  fyffe.setAverages(avg);
  fyffe.setStock(stock);
  await fyffe.import(cli['csv-files'], {
    dbName: 'tilitintin',
    service: cli.options.service,
    fund: cli.options.fund,
    ignore
  });
  await fyffe.export('tilitintin', { dbName: 'tilitintin' });
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
