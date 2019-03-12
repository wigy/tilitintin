#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';

knex.setUser(USER);
cli.arg('db', knex.dbs(USER));

config.loadIni();

async function main() {
  const dbName = 'db';
  fyffe.setDb(dbName, knex.db(cli.db));
  await fyffe.loadTags(dbName);
  await fyffe.loadAccounts(dbName);
  await fyffe.loadBalances(dbName);
  const {avg, stock} = await fyffe.loadPriceAndStock(dbName);
  fyffe.ledger.accounts.showBalances('Balances:');
  fyffe.stock.setStock(stock);
  fyffe.stock.setAverages(avg);
  fyffe.stock.showStock('Stock:');
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
