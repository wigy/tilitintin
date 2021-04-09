const express = require('express')
const router = express.Router()
const data = require('libfyffe').data.tilitintin.data
const knex = require('../lib/knex')

router.get('/',
  async (req, res) => {
    let where = null
    let order = ['number']
    if (req.query.period) {
      if ('entries' in req.query) {
        return data.getPeriodTransactionsWithEntries(knex.db(req.db), parseInt(req.query.period))
          .then((documents) => res.send(documents))
      }
      where = { period_id: parseInt(req.query.period) }
      order = ['date', 'number', 'id']
    }
    data.listAll(knex.db(req.db), 'document', where, order)
      .then(documents => res.send(documents))
  })

router.get('/:id',
  async (req, res) => {
    data.getOne(knex.db(req.db), 'document', req.params.id, 'entry', ['row_number'])
      .then(document => {
        document.entries.forEach((e) => {
          e.amount = Math.round(e.amount * 100)
        })
        res.send(document)
      })
  })

router.post('/',
  async (req, res) => {
    const locked = await data.isLocked(knex.db(req.db), 'period', req.body.period_id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    let number
    if (req.body.number !== null && req.body.number !== undefined) {
      number = req.body.number
    } else {
      number = await data.getNextDocument(knex.db(req.db), req.body.period_id)
    }
    if (!req.body.period_id) {
      console.error('No period given.')
      res.sendStatus(400)
      return
    }
    const document = { number }
    Object.assign(document, req.body)
    return data.createOne(knex.db(req.db), 'document', document)
      .then((data) => res.send(data))
  })

router.patch('/:id',
  async (req, res) => {
    const locked = await data.isLocked(knex.db(req.db), 'document', req.params.id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    return data.updateOne(knex.db(req.db), 'document', req.params.id, req.body)
      .then((status) => res.sendStatus(status))
  })

router.delete('/:id',
  async (req, res) => {
    const id = parseInt(req.params.id)
    const locked = await data.isLocked(knex.db(req.db), 'document', id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    return data.deleteMany(knex.db(req.db), 'entry', { document_id: id })
      .then(() => data.deleteOne(knex.db(req.db), 'document', id))
      .then((status) => res.sendStatus(status))
  })

module.exports = router
