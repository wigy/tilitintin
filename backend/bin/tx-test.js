#!/usr/bin/env node

const tx = require('../src/lib/tx');


tx.add('dataplug', 1, '2018-01-20', [
  {number: 1910, amount: -20.50, description: 'TRE - HKI - TRE'},
  {number: 7800, amount: 20.50, description: 'TRE - HKI - TRE'},
])
.then((tx) => {
  console.log('OK', tx);
});
