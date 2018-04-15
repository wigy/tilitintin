#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');

cli.opt('dry-run', null, 'To turn dry-run on.');
cli.opt('debug', null, 'To turn dry-run on and display entries.');
cli.opt('no-profit', null, 'Turn off profit and losses calculations (to be calculated later).');
cli.opt('zero-moves', null, 'Do not add to the stock commodities moved in.');
cli.opt('force', null, 'Import even if the entries are found already.');
cli.opt('avg', null, 'Set explicit averages `SERVICE1:ETH=123,SERVICE2:ETH=122`.');
cli.arg_('db', knex.dbs());
cli.args('csv-files', 'transaction log as CSV file(s)');

config.loadIni();

config.set({
  flags: {
    noProfit: cli.options['no-profit'],
    zeroMoves: cli.options['zero-moves'],
    dryRun: cli.options['dry-run'] || cli.options.debug,
    debug: cli.options.debug,
    force: cli.options.force
  }
});

let avg={};

if (cli.options.avg) {
  cli.options.avg.split(',').forEach((str) => {
    const eq = str.split('=');
    avg = avg || {};
    avg[eq[0]] = parseFloat(eq[1]);
  })
}

async function main() {
  fyffe.setDb('tilitintin', knex.db(cli.db))
  fyffe.setAverages(avg);
  await fyffe.import(cli['csv-files'], {dbName: 'tilitintin'});
  await fyffe.export('tilitintin', {dbName: 'tilitintin'});
}

main().catch((err) => console.error(err));
