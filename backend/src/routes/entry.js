const express = require('express');
const router = express.Router();
const data = require('../lib/data');

router.get('/', (req, res) => {
  let where = null;
  if (req.query.account_id) {
    where = {account_id: parseInt(req.query.account_id)};
  }
  data.listAll(req.db, 'entry', where, ['id'])
    .then(entries => res.send(entries));
});

router.post('/', async (req, res) => {
  const locked = await data.isLocked(req.db, 'document', req.body.document_id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  let obj = req.body;
  if ('amount' in obj) {
    obj.amount /= 100;
  }
  data.createOne(req.db, 'entry', obj)
    .then(entry => entry ? res.send(entry) : res.sendStatus(400));
});

router.get('/:id', (req, res) => {
  data.getOne(req.db, 'entry', req.params.id)
    .then(entry => res.send(entry));
});

router.patch('/:id', async (req, res) => {
  const locked = await data.isLocked(req.db, 'entry', req.params.id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  let obj = req.body;
  if ('amount' in obj) {
    obj.amount /= 100;
  }
  data.updateOne(req.db, 'entry', req.params.id, obj)
    .then((code) => res.status(code).send());
});

router.delete('/:id', async (req, res) => {
  const locked = await data.isLocked(req.db, 'entry', req.params.id);
  if (locked) {
    res.sendStatus(403);
    return;
  }
  data.deleteOne(req.db, 'entry', req.params.id)
    .then((code) => res.status(code).send());
});

module.exports = router;
