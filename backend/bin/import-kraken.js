#!/usr/bin/env node
const cli = require('../src/lib/cli');
const knex = require('../src/lib/knex');
const kraken = require('../src/lib/import/kraken');

cli.arg_('db', knex.dbs());
cli.arg('csv-file', 'transaction log from Kraken as CSV file');

kraken.import(cli.db, cli['csv-file']);
