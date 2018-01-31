const sprintf = require('sprintf');
const Import = require('./base');

class CoinmotionImport extends Import {

  constructor() {
    super('Coinmotion');
  }

  load(file) {
    return this.loadCSV(file);
  }

  date(entry) {
    const [_, d, m, y] = /^(\d+)\.(\d+)\.(\d+)/.exec(entry.Date);
    return sprintf('%04d-%02d-%02d', parseInt(y), parseInt(m), parseInt(d));
  }

  grouping(entries) {
    let ret = {};
    entries.forEach((entry) => {
      let name = entry.Date + '/' + entry.Type;
      ret[name] = ret[name] || [];
      ret[name].push(entry);
    });
    ret = Object.values(ret);
    return Promise.resolve(ret);
  }

  recognize(txo) {

    if (txo.src.length === 1) {
      switch (txo.src[0].Type) {
        case 'Deposit':
          return 'deposit';
      }
    }

    if (txo.src.length >= 2) {
      switch (txo.src[0].Type) {
        case 'Buy':
        case 'Buy stop':
        case 'Limit buy':
          return 'buy';
        case 'Sell':
        case 'Sell stop':
          return 'sell';
      }
    }

    throw new Error('Cannot recognize entry ' + JSON.stringify(txo));
  }

  total(txo) {
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.Account === 'EUR') {
        total += Math.abs(parseFloat(entry.Amount.replace(/ €/, '')));
      }
    });
    return Math.round(total * 100) / 100;
  }

  fee(txo) {
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.Account === 'EUR') {
        total += Math.abs(parseFloat(entry.Fee.replace(/ €/, '')));
      }
    });
    return Math.round(total * 100) / 100;
  }

  target(txo) {
    const crypto = txo.src.filter((entry) => entry.Account !== 'EUR');
    if (crypto.length) {
      switch (crypto[0].Account) {
        case 'BTC':
          return 'BTC';
      }
    }
    throw new Error('Cannot recognize trade target for ' + JSON.stringify(txo.src));
  }

  amount(txo) {
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.Account === txo.target) {
        total += Math.abs(parseFloat(entry.Amount.replace(/ [A-Z]+/, '')));
      }
    });
    return total;
  }
}

module.exports = new CoinmotionImport();
