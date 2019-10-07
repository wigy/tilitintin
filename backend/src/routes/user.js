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
  const {user, name, password, email} = req.body;
  if (!user || !/^[a-z0-9]+$/.test(user)) {
    console.error(`User name ${user} is not valid (lower case letters and numbers only).`);
    return res.sendStatus(400);
  }
  if (password.length < 4) {
    console.error(`Password is too short.`);
    return res.sendStatus(400);
  }
  if (!email) {
    console.error(`Email is required.`);
    return res.sendStatus(400);
  }
  if (!name) {
    console.error(`Full name is required.`);
    return res.sendStatus(400);
  }
  if (users.hasUser(user)) {
    console.error(`User '${user}' exists.`);
    return res.sendStatus(400);
  }

  users.registerUser({user, name, password, email})
    .then((data) => {
      res.send(data);
    });
});

router.patch('/:user', async (req, res) => {
});

router.delete('/:user', async (req, res) => {
});

module.exports = router;
