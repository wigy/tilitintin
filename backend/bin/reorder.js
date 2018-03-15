#!/usr/bin/env node
/**
 * This script reorganizes all document numbers and put them into the date order.
 */
const promiseSeq = require('promise-sequential');
const knex = require('../src/lib/knex');
const { util: { cli} } = require('libfyffe');

cli.arg('db', knex.dbs());

knex.db(cli.db)
  .select('*')
  .from('document')
  .orderBy(['period_id', 'date', 'number'])
  .then((data) => {
    let pairs = [];
    let periodId = null;
    let num = null;
    data.forEach((line) => {
      if (line.period_id !== periodId) {
        if (line.number !== 0) {
          throw Error('Hmm. First number ' + line.number + ' of the period ' + line.period_id + ' is not 0? ' + JSON.stringify(line));
        }
        periodId = line.period_id;
        num = 1;
        return;
      }
      if (line.number !== num) {
        pairs.push([line.id, num]);
        console.log('Need to change', line.number, 'to', num);
      }
      num++;
    });
    return pairs;
  })
  .then((pairs) => {
    // TODO: Update import document numbers.
    return pairs.map(pair => () => knex.db(cli.db)('document').where({id: pair[0]}).update({number: pair[1]}));
  })
  .then((txs) => promiseSeq(txs));
