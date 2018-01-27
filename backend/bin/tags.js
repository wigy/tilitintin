#!/usr/bin/env node

const knex = require('../src/lib/knex');
const tags = require('../src/lib/tags');
const cli = require('../src/lib/cli');

cli.arg('db', knex.dbs());
cli.arg('operation', ['ls', 'add']);

switch(cli.operation) {
  case 'add':
    cli.arg_('tag', 'a tag text');
    cli.arg_('name', 'a descrition text of the tag');
    cli.arg_('picture', 'an url for the picuture');
    cli.arg_('type', 'a category of the tag');
    cli.arg('order', 'an order number of the tag', parseInt);
    tags.add(cli.db, cli.tag, cli.name, cli.picture, cli.type, cli.order);
    break;

  case 'ls':
    tags.getAll(cli.db)
      .then((tags) => {
        console.log(tags);
      });
    break;
}
