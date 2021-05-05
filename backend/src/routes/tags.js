const express = require('express')
const router = express.Router()
const tags = require('../lib/tags')
const data = require('../lib/data')
const knex = require('../lib/knex')
const jwt = require('jsonwebtoken')
const config = require('../config')

router.get('/',
  async (req, res) => {
    tags.isReady(knex.db(req.db))
      .then((ready) => {
        if (!ready) {
          return res.send([])
        }
        return data.listAll(knex.db(req.db), 'tags')
          .then(data => res.send(data))
      })
  })

router.get('/tokens',
  async (req, res) => {
    tags.isReady(knex.db(req.db))
      .then((ready) => {
        if (!ready) {
          return res.send([])
        }
        data.listAll(knex.db(req.db), 'tags')
          .then((tags) => {
            res.send(tags.map(tag => ({
              id: tag.id,
              tag: tag.tag,
              token: jwt.sign({
                id: tag.id,
                tag: tag.tag,
                db: req.db,
                user: req.user,
                service: 'Tilitintin'
              }, config.SECRET)
            })))
          })
      })
  })

router.get('/:id',
  async (req, res) => {
    tags.isReady(knex.db(req.db))
      .then((ready) => {
        if (!ready) {
          return res.send({})
        }
        data.getOne(knex.db(req.db), 'tags', req.params.id)
          .then(tag => {
            res.send(tag)
          })
      })
  })

module.exports = router
