const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  let where = null;
  let order = ['number'];
  if (req.query.period) {
    if ('entries' in req.query) {
      return data.getPeriodTransactionsWithEntries(req.db, parseInt(req.query.period))
        .then((documents) => res.send(documents));
    }
    where = { period_id: parseInt(req.query.period) };
    order = ['date', 'number', 'id'];
  }
  data.listAll(req.db, 'document', where, order)
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
  const locked = await data.isLocked(req.db, 'period', req.body.period_id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  let number;
  if (req.body.number !== null && req.body.number !== undefined) {
    number = req.body.number;
  } else {
    number = await data.getNextDocument(req.db, req.body.period_id);
  }
  return data.createOne(req.db, 'document', {...req.body, number})
    .then((data) => res.send(data));
});

router.patch('/:id', async (req, res) => {
  const locked = await data.isLocked(req.db, 'document', req.params.id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  return data.updateOne(req.db, 'document', req.params.id, req.body)
    .then((status) => res.sendStatus(status));
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const locked = await data.isLocked(req.db, 'document', id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  return data.deleteMany(req.db, 'entry', {document_id: id})
    .then(() => data.deleteOne(req.db, 'document', id))
    .then((status) => res.sendStatus(status));
});

module.exports = router;
