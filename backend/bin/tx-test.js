#!/usr/bin/env node

process.env.DBPATH = __dirname + '/../databases';

const tx = require('../src/lib/tx');

tx.add('dataplug', 1, '2018-01-20', [
  {number: 1910, amount: -20.50, description: 'TRE - HKI - TRE'},
  {number: 29392, amount: 0.50},
  {number: 7800, amount: 20.00},
])
.then((tx) => {
  console.log('OK', tx);
});
