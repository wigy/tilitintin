const path = require('path');
const fs = require('fs');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../config');
const knex = require('../lib/knex');
const { checkToken } = require('../lib/middleware');
const { dateToDb } = require('libfyffe').data.tilitintin.utils;
const { empty } = require('libfyffe').data.tilitintin.db;

router.post('/',
  checkToken,
  express.urlencoded({ extended: true }),
  express.json(),
  async (req, res) => {
    const { databaseName, companyName, companyCode } = req.body;

    if (!/^[0-9a-z-_]+$/.test(databaseName)) {
      console.error(`Invalid database name ${databaseName}.`);
      return res.sendStatus(400);
    }

    if (knex.dbs(req.user).includes(databaseName)) {
      console.error(`Database ${databaseName} exists.`);
      return res.sendStatus(400);
    }

    const dst = knex.userPath(`${databaseName}.sqlite`);
    fs.writeFileSync(dst, empty());

    // Initialize database.
    const db = knex.db(databaseName);

    await db('settings').update({ name: companyName, business_id: companyCode });

    const year = moment().format('Y');
    // Note: Using Tilitin compatible time-zone offsets.
    const start = dateToDb(`${year}-01-01`);
    const end = dateToDb(`${year}-12-31`);
    const lastYear = dateToDb(`${year - 1}-12-31`);
    await db('period').insert({ id: 1, start_date: start, end_date: end, locked: false });
    await db('document').insert({ id: 1, number: 0, period_id: 1, date: lastYear });

    res.sendStatus(204);
  });

router.post('/upload',
  async (req, res) => {
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
