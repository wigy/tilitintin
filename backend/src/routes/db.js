const path = require('path');
const fs = require('fs');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const config = require('../config');
const knex = require('../lib/knex');
const { checkToken } = require('../lib/middleware');

router.post('/', checkToken, bodyParser.json(), async (req, res) => {
  const { databaseName, companyName, companyCode } = req.body;
  if (knex.dbs(req.user).includes(databaseName)) {
    console.error(`Database ${databaseName} exists.`);
    return res.sendStatus(400);
  }
  const src = path.join(__dirname, '..', 'data', 'empty.sqlite');
  const dst = knex.userPath(`${databaseName}.sqlite`);
  fs.copyFileSync(src, dst);

  // Initialize database.
  const db = knex.db(databaseName);

  await db('settings').update({ name: companyName, business_id: companyCode });

  const year = moment().format('Y');
  // Note: Using Tilitin compatible time-zone offsets.
  const start = moment(`${year}-01-01T00:00:00+02:00`).unix();
  const end = moment(`${year}-12-31T00:00:00+02:00`).unix();
  const lastYear = moment(`${year - 1}-12-31T00:00:00+02:00`).unix();
  await db('period').insert({ id: 1, start_date: start * 1000, end_date: end * 1000, locked: false });
  await db('document').insert({ id: 1, number: 0, period_id: 1, date: lastYear * 1000 });

  res.sendStatus(204);
});

// sqlite> select * from period;
// 1|1546293600000|1577743200000|0
// sqlite> select * from document;
// 1|0|1|1546293600000

router.post('/upload', async (req, res) => {
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
