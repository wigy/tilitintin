const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  data.listAll(req.db, 'document', null, ['number'])
    .then(documents => res.send(documents));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'document', req.params.id, 'entry', ['row_number'])
    .then(document => {
      document.entries.forEach((e) => {
        e.amount = Math.round(e.amount * 100);
      });
      res.send(document);
    });
});

router.post('/', async (req, res) => {
  const number = await data.getNextDocument(req.db, req.body.period_id);
  return data.createOne(req.db, 'document', {...req.body, number})
    .then((data) => res.send(data));
});

router.patch('/:id', (req, res) => {
  return data.updateOne(req.db, 'document', req.params.id, req.body)
    .then((status) => res.sendStatus(status));
});

module.exports = router;
