const express = require('express');
const router = express.Router();
const users = require('../lib/users');

router.get('/', (req, res) => {
  users.getAll()
    .then((users) => res.send(users));
});

router.get('/:user', (req, res) => {
  users.getOne(req.params.user)
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      res.sendStatus(404);
    });
});

router.post('/', async (req, res) => {
  // TODO: Validate as in form.
  const {user, name, password, email} = req.body;
  if (users.hasUser(user)) {
    res.sendStatus(400);
  } else {
    users.registerUser({user, name, password, email})
      .then((data) => {
        res.send(data);
      });
  }
});

router.patch('/:user', async (req, res) => {
});

router.delete('/:user', async (req, res) => {
});

module.exports = router;
