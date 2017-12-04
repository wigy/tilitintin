const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'coa_heading', null, ['id'])
    .then(data => res.send(data));
});

module.exports = router;
