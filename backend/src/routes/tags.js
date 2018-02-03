const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'tags')
    .then(data => res.send(data));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'tags', req.params.id)
    .then(tag => {
      res.send(tag);
    });
});

module.exports = router;
