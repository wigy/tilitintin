const express = require('express');
const router = express.Router();
const tags = require('libfyffe').data.tilitintin.tags;
const data = require('libfyffe').data.tilitintin.data;
const knex = require('../lib/knex');

router.get('/', (req, res) => {
  tags.isReady(knex.db(req.db))
    .then((ready) => {
      if (!ready) {
        return res.send([]);
      }
      return data.listAll(knex.db(req.db), 'tags')
        .then(data => res.send(data));
    });
});

router.get('/:id', (req, res) => {
  tags.isReady(knex.db(req.db))
    .then((ready) => {
      if (!ready) {
        return res.send({});
      }
      data.getOne(knex.db(req.db), 'tags', req.params.id)
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
      data.getOne(knex.db(req.db), 'tags', req.params.id)
        .then(tag => {
          res.header('Content-Type', tag.mime);
          res.send(tag.picture);
        });
    });
});

module.exports = router;
