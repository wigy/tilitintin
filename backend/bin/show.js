#!/usr/bin/env node
const knex = require('../src/lib/knex');
const { config, util: {cli}, core: {fyffe} } = require('libfyffe');

cli.arg('db', knex.dbs());

config.loadIni();

async function main() {
  const dbName = 'db';
  fyffe.setDb(dbName, knex.db(cli.db))
  await fyffe.loadTags(dbName);
  await fyffe.loadAccounts(dbName);
  await fyffe.loadBalances(dbName);
  const {avg, stock} = await fyffe.loadPriceAndStock(dbName);
  fyffe.ledger.accounts.showBalances('Balances:');
  fyffe.stock.setStock(stock);
  fyffe.stock.setAverages(avg);
  fyffe.stock.showStock('Stock:');
}

main().catch((err) => console.error(err));
