#!/usr/bin/env node
const promiseSeq = require('promise-sequential');
const knex = require('../src/lib/knex');
const tags = require('../src/lib/tags');
const { util: { cli} } = require('libfyffe');

cli.arg_('db', knex.dbs());
cli.arg('operation', ['ls', 'add', 'remove-all']);

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

  case 'remove-all':
    knex.db(cli.db)
    .select('id', 'description')
    .from('entry')
    .where('description', 'like', '[%')
    .then((data) => {
      let changers = [];
      data.forEach((entry) => {
        let id = entry.id;
        let desc = entry.description.replace(/^(\[[A-Za-z0-9]+\])+\s*/, '')
        console.log('Trimming description to `' + desc + '` for', id);
        changers.push(() => knex.db(cli.db)('entry').where({id: id}).update({description: desc}));
      });
      return changers;
    })
    .then((changers) => promiseSeq(changers));
    break;
}
