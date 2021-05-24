const express = require('express')
const router = express.Router()
const dump = require('neat-dump')
const users = require('../lib/users')

router.get('/',
  async (req, res) => {
    users.getAll()
      .then((users) => res.send(users))
  })

router.get('/:user',
  async (req, res) => {
    users.getOne(req.params.user)
      .then((user) => res.send(user))
      .catch((err) => {
        console.error(err)
        res.sendStatus(404)
      })
  })

router.post('/',
  async (req, res) => {
    const { user, name, password, email } = req.body
    const err = users.validateUser(user, name, password, email)
    if (err !== true) {
      dump.error(err)
      return res.status(400).send({ message: err })
    }

    users.registerUser({ user, name, password, email })
      .then((data) => {
        res.send(data)
      })
  })

router.patch('/:user',
  async (req, res) => {
  })

router.delete('/:user',
  async (req, res) => {
  })

module.exports = router
