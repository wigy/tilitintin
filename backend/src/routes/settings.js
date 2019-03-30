const express = require('express');
const router = express.Router();
const knex = require('../lib/knex');

router.get('/', (req, res) => {
  knex.db(req.db)('fyffe_settings').select('*')
    .then((data) => {
      let ret = {};
      data.forEach((setting) => {
        ret[setting.name] = setting.value;
      });
      res.send(ret);
    });
});

module.exports = router;
