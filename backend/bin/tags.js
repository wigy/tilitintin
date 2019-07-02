#!/usr/bin/env node
const promiseSeq = require('promise-sequential');
const rp = require('request-promise');
const path = require('path');
const fs = require('fs');
const tags = require('libfyffe').data.tilitintin.tags;
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
            if (!fs.existsSync(`${dir}/${tag.tag}.jpg`) && !fs.existsSync(`${dir}/${tag.tag}.png`)) {
              console.log(`Fetching ${tag.name} from ${tag.picture}`);
              await rp.get(tag.picture)
                .then((bin) => {
                  const filePath = new URL(tag.picture).pathname;
                  if (/\.jp?g$/i.test(filePath)) {
                    fs.writeFileSync(`${dir}/${tag.tag}.jpg`);
                  } else if (/\.png$/i.test(filePath)) {
                    fs.writeFileSync(`${dir}/${tag.tag}.png`);
                  } else {
                    fs.writeFileSync(`${dir}/${tag.tag}.unknown`);
                    console.log(`Cannot figure out file type. Check and rename ${dir}/${tag.tag}.unknown`);
                  }
                })
                .catch((err) => {
                  console.log(`Failed to fetch ${tag.picture}`);
                });
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
