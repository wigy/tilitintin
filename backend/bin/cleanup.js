#!/usr/bin/env node
/**
 * This script removes documents without any entries.
 */
const promiseSeq = require('promise-sequential');
const knex = require('../src/lib/knex');
const { util: {cli} } = require('libfyffe');

cli.arg('db', knex.dbs());

knex.db(cli.db)
  .count('entry.id AS entries')
  .select('document.id', 'document.number')
  .from('document')
  .where('document.number', '>', 0)
  .leftJoin('entry', 'entry.document_id', 'document.id')
  .groupBy('document.id')
  .having('entries', '=', 0)
  .then((data) => {
    if (!data.length) {
      console.log('All good.');
      return [];
    }
    console.log('Dropping documents', data.map((d) => d.number).join(', '));
    return data.map((d) => () => knex.db(cli.db)('document').where({id: d.id}).delete());
  })
  .then((txs) => promiseSeq(txs))
  .then(() => process.exit());
