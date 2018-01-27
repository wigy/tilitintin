#!/usr/bin/env node

const knex = require('../src/lib/knex');
const tags = require('../src/lib/tags');
const cli = require('../src/lib/cli');

cli.arg('db', knex.dbs());
cli.arg('operation', ['ls', 'add']);

switch(cli.operation) {
  case 'add':
    cli.arg_('tag', 'a tag text');
    cli.arg_('name', 'a category of the tag');
    cli.arg_('picture', 'a category of the tag');
    cli.arg('type', 'a category of the tag');
    cli.arg('order', 'a category of the tag', parseInt);
    tags.add(cli.db, cli.tag, cli.name, cli.picture, cli.type, cli.order);
    break;
}
