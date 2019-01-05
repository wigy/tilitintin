const express = require('express');
const router = express.Router();
const data = require('../lib/data');
const tags = require('../lib/tags');

router.get('/', (req, res) => {
  tags.isReady(req.db)
    .then((ready) => {
      if (!ready) {
        return res.send([]);
      }
      return data.listAll(req.db, 'tags')
        .then(data => res.send(data));
    });
});

router.get('/:id', (req, res) => {
  tags.isReady(req.db)
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

module.exports = router;
