const express = require('express');
const router = express.Router();
const data = require('libfyffe').data.tilitintin.data;
const knex = require('../lib/knex');

router.get('/', (req, res) => {
  data.listAll(knex.db(req.db), 'coa_heading', null, ['number', 'level'])
    .then(data => res.send(data));
});

module.exports = router;
