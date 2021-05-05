const express = require('express')
const router = express.Router()
const dump = require('neat-dump')
const config = require('../config')
const knex = require('../lib/knex')
const users = require('../lib/users')
const { getToken, checkToken, checkAdminToken } = require('../lib/middleware')
const tags = require('../lib/tags')
const data = require('../lib/data')

/**
 * Authenticate against fixed credentials and construct a token.
 */
router.post('/auth',
  express.urlencoded({ extended: true }),
  express.json(),
  async (req, res) => {
    const { user, password } = req.body
    const token = await users.login(user, password)
    if (token) {
      res.send({ token })
    } else {
      res.status(401).send('Invalid user or password.')
    }
  })

/**
 * Get the readiness status of the application.
 */
router.get('/status',
  (req, res) => {
    res.send({ hasAdminUser: users.hasAdminUser() })
  })

/**
 * Create new admin user.
 */
router.post('/register',
  express.urlencoded({ extended: true }),
  express.json(),
  async (req, res) => {
    const { user, name, email, password, admin } = req.body
    if (admin) {
      if (users.hasAdminUser()) {
        res.sendStatus(400)
      } else {
        const err = users.validateUser(user, name, password, email)
        if (err !== true) {
          dump.error(err)
          res.sendStatus(400)
        } else if (!await users.registerUser({ user, name, email, password, admin })) {
          res.sendStatus(500)
        } else {
          res.sendStatus(204)
        }
      }
    } else {
      res.sendStatus(400)
    }
  })

router.get('/',
  checkToken,
  (req, res) => {
    res.send({
      links: {
        databases: config.BASEURL + '/db'
      }
    })
  })

router.get('/db',
  checkToken,
  (req, res) => {
    res.send(knex.dbs(req.user).map(db => {
      return { name: db, links: { view: config.BASEURL + '/db/' + db } }
    }))
  })

function checkDb(req, res, next) {
  const { db } = req.params
  if (!req.user || !knex.isDb(req.user, db)) {
    res.status(404).send('Database not found.')
  } else {
    req.db = db
    knex.setUser(req.user)
    next()
  }
}

router.get('/db/:db',
  checkToken,
  checkDb,
  (req, res) => {
    const { db } = req.params
    res.send({
      links: {
        periods: config.BASEURL + '/db/' + db + '/period',
        accounts: config.BASEURL + '/db/' + db + '/account',
        documents: config.BASEURL + '/db/' + db + '/document',
        entries: config.BASEURL + '/db/' + db + '/entry',
        headings: config.BASEURL + '/db/' + db + '/heading',
        tags: config.BASEURL + '/db/' + db + '/tags',
        report: config.BASEURL + '/db/' + db + '/report'
      }
    })
  })

router.get('/db/:db/tags/:id/view',
  async (req, res) => {
    const token = getToken(req)
    if (!token) {
      dump.error('Missing token.')
      return res.sendStatus(403)
    }
    const payload = await users.verifyToken(token, false, false)
    if (!payload) {
      dump.error('Invalid token.')
      return res.sendStatus(403)
    }
    // Handle special tokens allowing only tag viewing.
    let db
    if (payload.tag) {
      knex.setUser(payload.user)
      if (payload.db !== req.params.db || parseInt(payload.id) !== parseInt(req.params.id)) {
        dump.error('Invalid DB or ID.')
        return res.sendStatus(403)
      }
      db = knex.db(payload.db)
    } else {
    // Otherwise use the authenticated user token.
      knex.setUser(payload.user)
      db = knex.db(req.params.db)
    }
    tags.isReady(db)
      .then((ready) => {
        if (!ready) {
          return res.send('')
        }
        data.getOne(db, 'tags', req.params.id)
          .then(tag => {
            if (payload.tag && tag.tag !== payload.tag) {
              dump.error('Invalid tag.')
              return res.sendStatus(403)
            }
            res.header('Content-Type', tag.mime)
            res.send(tag.picture)
          })
      })
  })

router.use('/db/:db/period',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./period'))

router.use('/db/:db/account',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./account'))

router.use('/db/:db/document',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./document'))

router.use('/db/:db/entry',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./entry'))

router.use('/db/:db/heading',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./heading'))

router.use('/db/:db/tags',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./tags'))

router.use('/db/:db/report',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./report'))

router.use('/db/:db/settings',
  express.urlencoded({ extended: true }),
  express.json(),
  checkToken,
  checkDb,
  require('./settings'))

router.use('/admin/user',
  express.urlencoded({ extended: true }),
  express.json(),
  checkAdminToken,
  require('./user'))

router.use('/db',
  express.urlencoded({ extended: true }),
  checkToken,
  require('./db'))

module.exports = router
