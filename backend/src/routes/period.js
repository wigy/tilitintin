const express = require('express');
const router = express.Router();
const data = require('../lib/data');
const db = require('../lib/db');

router.get('/', (req, res) => {
  data.listAll('period', null, ['start_date', 'desc'])
    .then(data => res.send(data));
});

router.get('/:id', (req, res) => {
  data.getOne('period', req.params.id)
    .then(data => {
      // TODO: Move to the library.
      return db.select('account.id', 'account.number', 'account.name').sum('entry.amount as amount').from('entry')
        .leftJoin('account', 'account.id', 'entry.account_id')
        .leftJoin('document', 'document.id', 'entry.document_id')
        .where({'document.period_id': 1})
        .where({'entry.debit': 0})
        .groupBy('entry.account_id')
        .then(entries => {
          data.credit = entries;
          return data;
        });
    })
    .then(data => {
      // TODO: Move to the library.
      return db.select('account.id', 'account.number', 'account.name').sum('entry.amount as amount').from('entry')
      .leftJoin('account', 'account.id', 'entry.account_id')
      .leftJoin('document', 'document.id', 'entry.document_id')
      .where({'document.period_id': 1})
      .where({'entry.debit': 1})
      .groupBy('entry.account_id')
      .then(entries => {
        data.debit = entries;
        return data;
      });
    })
    .then(data => {
      let accounts = {};
      data.debit.forEach(item => {
        accounts[item.id] = item;
        accounts[item.id].debit = Math.round(item.amount * 100); // TODO: Maybe better on DB level?
      });
      data.credit.forEach(item => {
        accounts[item.id] = accounts[item.id] || item;
        accounts[item.id].credit = Math.round(item.amount * 100); // TODO: Maybe better on DB level?
      });

      data.accounts = Object.values(accounts);
      data.accounts.forEach(account => {
        account.debit = account.debit || 0;
        account.credit = -account.credit || 0;
        account.total = account.debit + account.credit;
      });

      delete data.debit;
      delete data.credit;

      res.send(data);
    });
});

module.exports = router;
//select account.number, account.name, sum(entry.amount) from entry left join account on account.id=entry.account_id left join document on document.id = entry.document_id where entry.debit=0 and document.period_id=1 group by entry.account_id;
