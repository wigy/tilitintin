#!/usr/bin/env node
const promiseSeq = require('promise-sequential');
const path = require('path');
const fs = require('fs');
const tags = require('../src/lib/tags');
const knex = require('../src/lib/knex');
const { util: { cli } } = require('libfyffe');
const USER = process.env.FYFFE_USER || 'user';

knex.setUser(USER);
cli.arg_('db', knex.dbs(USER));
cli.arg('operation', ['ls', 'add', 'remove-all', 'store-local']);

async function main() {

  switch (cli.operation) {

    case 'add':
      cli.arg_('tag', 'a tag text');
      cli.arg_('name', 'a description text of the tag');
      cli.arg_('picture', 'an url for the picture');
      cli.arg_('type', 'a category of the tag');
      cli.arg('order', 'an order number of the tag', parseInt);
      return tags.add(knex.db(cli.db), cli.tag, cli.name, cli.picture, cli.type, cli.order);

    case 'ls':
      return tags.getAll(knex.db(cli.db))
        .then((tags) => {
          console.log(tags);
        });

    case 'store-local':
      return knex.db(cli.db)
        .select('*')
        .from('tags')
        .then(async (data) => {
          const dir = path.join(__dirname, '..', 'databases', USER);
          for await (tag of data) {
            let mime, img;
            if (fs.existsSync(`${dir}/${tag.tag}.jpg`)) {
              mime = 'image/jpeg';
              img = `${dir}/${tag.tag}.jpg`;
            }
            if (fs.existsSync(`${dir}/${tag.tag}.png`)) {
              mime = 'image/png';
              img = `${dir}/${tag.tag}.png`;
            }
            if (mime) {
              console.log(`Saving #${tag.id} ${tag.name} from ${img} as ${mime}`);
              const pic = fs.readFileSync(img);
              await knex.db(cli.db)('tags').update({mime, picture: pic}).where({id: tag.id});
            }
          }
        });

    case 'remove-all':
      return knex.db(cli.db)
        .select('id', 'description')
        .from('entry')
        .where('description', 'like', '[%')
        .then((data) => {
          let changers = [];
          data.forEach((entry) => {
            let id = entry.id;
            let desc = entry.description.replace(/^(\[[A-Za-z0-9]+\])+\s*/, '');
            console.log('Trimming description to `' + desc + '` for', id);
            changers.push(() => knex.db(cli.db)('entry').where({id: id}).update({description: desc}));
          });
          return changers;
        })
        .then((changers) => promiseSeq(changers));
  }
}

main()
  .then(() => process.exit())
  .catch((err) => { console.error(err); process.exit(); });
