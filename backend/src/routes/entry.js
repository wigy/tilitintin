const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll('entry', null, ['id'])
    .then(entries => res.send(entries));
});

module.exports = router;
