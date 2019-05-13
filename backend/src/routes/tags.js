const express = require('express');
const router = express.Router();
const dump = require('neat-dump');
const tags = require('libfyffe').data.tilitintin.tags;
const data = require('../lib/data');
const knex = require('../lib/knex');

router.get('/', (req, res) => {
  tags.isReady(knex.db(req.db))
    .then((ready) => {
      if (!ready) {
        return res.send([]);
      }
      return data.listAll(req.db, 'tags')
        .then(data => res.send(data));
    });
});

router.get('/:id', (req, res) => {
  tags.isReady(knex.db(req.db))
    .then((ready) => {
      if (!ready) {
        return res.send({});
      }
      data.getOne(req.db, 'tags', req.params.id)
        .then(tag => {
          res.send(tag);
        });
    });
});

router.get('/:id/view', (req, res) => {
  tags.isReady(knex.db(req.db))
    .then((ready) => {
      if (!ready) {
        return res.send('');
      }
      data.getOne(req.db, 'tags', req.params.id)
        .then(tag => {
          const jpg = knex.userFile(tag.tag + '.jpg');
          if (jpg) {
            res.sendFile(jpg);
          } else {
            const png = knex.userFile(tag.tag + '.png');
            if (png) {
              res.sendFile(png);
            } else {
              dump.warning('Tag', tag.tag, 'uses directly', tag.picture);
              res.redirect(tag.picture);
            }
          }
        });
    });
});

module.exports = router;
