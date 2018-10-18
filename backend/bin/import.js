#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');

cli.opt('avg', null, 'Set explicit averages `SERVICE1:ETH=123,SERVICE2:ETH=122`.');
cli.opt('debug', null, 'To turn dry-run on and display entries.');
cli.opt('dry-run', null, 'To turn dry-run on.');
cli.opt('force', null, 'Import even if the entries are found already.');
cli.opt('no-profit', null, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('service', null, 'Set explicit name for the service instead of the automatic recognition.');
cli.opt('show-stock', null, 'Display stock before and after.');
cli.opt('show-balances', null, 'Display account balances before and after.');
cli.opt('stock', null, 'Set explicit stocks `SERVICE1:ETH=0.12,SERVICE2:ETH=1.22`.');
cli.opt('zero-moves', null, 'Do not add to the stock commodities moved in.');
cli.arg_('db', knex.dbs());
cli.args('csv-files', 'transaction log as CSV file(s)');

config.loadIni();

config.set({
  flags: {
    noProfit: cli.options['no-profit'],
    zeroMoves: cli.options['zero-moves'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    debug: cli.options.debug,
    force: cli.options.force,
    showStock: cli.options['show-stock'],
    showBalances: cli.options['show-balances'],
  }
});

let avg={};
let stock={};

if (cli.options.avg) {
  cli.options.avg.split(',').forEach((str) => {
    const eq = str.split('=');
    avg = avg || {};
    avg[eq[0]] = parseFloat(eq[1]);
  })
}
if (cli.options.stock) {
  cli.options.stock.split(',').forEach((str) => {
    const eq = str.split('=');
    stock = stock || {};
    stock[eq[0]] = parseFloat(eq[1]);
  })
}

async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db))
  fyffe.setAverages(avg);
  fyffe.setStock(stock);
  await fyffe.import(cli['csv-files'], {dbName: 'tilitintin', service: cli.options.service});
  await fyffe.export('tilitintin', {dbName: 'tilitintin'});
}

main()
  .then(() =>   process.exit())
  .catch((err) => {console.error(err); process.exit()});
