const express = require('express')
const router = express.Router()
const data = require('libfyffe').data.tilitintin.data
const knex = require('../lib/knex')

router.get('/',
  async (req, res) => {
    let where = null
    if (req.query.account_id) {
      where = { account_id: parseInt(req.query.account_id) }
    }
    data.listAll(knex.db(req.db), 'entry', where, ['document_id', 'id'])
      .then(entries => res.send(entries))
  })

router.post('/',
  async (req, res) => {
    const locked = await data.isLocked(knex.db(req.db), 'document', req.body.document_id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    const obj = req.body
    if ('amount' in obj) {
      obj.amount /= 100
    }
    if (!obj.account_id) {
      console.error('No account given.')
      res.sendStatus(400)
      return
    }
    if (!obj.document_id) {
      console.error('No document given.')
      res.sendStatus(400)
      return
    }
    data.createOne(knex.db(req.db), 'entry', obj)
      .then(entry => entry ? res.send(entry) : res.sendStatus(400))
  })

router.get('/:id',
  async (req, res) => {
    data.getOne(knex.db(req.db), 'entry', req.params.id)
      .then(entry => res.send(entry))
  })

router.patch('/:id',
  async (req, res) => {
    const locked = await data.isLocked(knex.db(req.db), 'entry', req.params.id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    const obj = req.body
    if (!obj.account_id) {
      console.error('No account given.')
      res.sendStatus(400)
      return
    }
    if (!obj.document_id) {
      console.error('No document given.')
      res.sendStatus(400)
      return
    }
    if ('amount' in obj) {
      obj.amount /= 100
    }
    data.updateOne(knex.db(req.db), 'entry', req.params.id, obj)
      .then((code) => res.status(code).send())
  })

router.delete('/:id',
  async (req, res) => {
    const locked = await data.isLocked(knex.db(req.db), 'entry', req.params.id)
    if (locked) {
      res.sendStatus(403)
      return
    }
    data.deleteOne(knex.db(req.db), 'entry', req.params.id)
      .then((code) => res.status(code).send())
  })

module.exports = router
