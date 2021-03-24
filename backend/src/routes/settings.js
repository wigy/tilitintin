const express = require('express');
const router = express.Router();
const settings = require('../lib/settings');
const knex = require('../lib/knex');

router.get('/',
  async (req, res) => {
    const generic = await knex.db(req.db)('settings').select('*').first();
    const fyffe = await settings.getAll(req.db);
    Object.assign(generic, fyffe);
    res.send(generic);
  });

module.exports = router;
