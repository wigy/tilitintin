#!/usr/bin/env node

const knex = require('../src/lib/knex');
const data = require('../src/lib/data');
const cli = require('../src/lib/cli');

cli.arg('db', knex.dbs());
cli.arg('period',
  ({db}) => data.listAll(db, 'period', null, ['id']).then((data) => data.map(period => period.id))
);


Promise.all(cli.__promises)
  .then(() => {
    console.log('ok');
    console.log(cli.period);
  })
