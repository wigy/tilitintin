const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../config');

router.post('/', async (req, res) => {
  const PATH = path.join(config.DBPATH, req.user);
  const upload = multer({ dest: PATH });
  upload.single('file')(req, res, function(err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      fs.rename(req.file.path, path.join(PATH, req.file.originalname || 'database.sqlite'), function(err) {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = router;