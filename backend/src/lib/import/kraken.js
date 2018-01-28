const Import = require('./base');

class KrakenImport extends Import {

  constructor(serviceName) {
    super('Kraken');
  }

  load(file) {
    return this.loadCSV(file);
  }

  grouping(entries) {
    let ret = {};
    entries.forEach((entry) => {
      ret[entry.refid] = ret[entry.refid] || [];
      ret[entry.refid].push(entry);
    });

    return Promise.resolve(Object.values(ret));
  }

  recognize(txo) {

    if (txo.src.length === 1) {
      const what = txo.src[0].type + '-' + txo.src[0].asset;
      if (what === 'deposit-ZEUR' || what === 'withdrawal-ZEUR') {
        return txo.src[0].type;
      }
    }

    if (txo.src.length === 2) {
      const euro = txo.src.filter((entry) => entry.asset === 'ZEUR');
      if (euro.length) {
        return parseFloat(euro[0].amount) < 0 ? 'buy' : 'sell';
      }
    }

    throw new Error('Cannot recognize entry ' + JSON.stringify(txo));
  }

  date(txo) {
    return txo.src[0].time.substr(0, 10);
  }

  total(txo) {
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.asset === 'ZEUR') {
        total += Math.abs(parseFloat(entry.amount));
        total += Math.abs(parseFloat(entry.fee));
      }
    });
    return Math.round(total * 100) / 100;
  }

  fee(txo) {
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.asset === 'ZEUR') {
        total += Math.abs(parseFloat(entry.fee));
      }
    });
    return Math.round(total * 100) / 100;
  }

  target(txo) {
    if (txo.type !== 'buy' && txo.type !== 'sell') {
      return null;
    }
    const crypto = txo.src.filter((entry) => entry.asset !== 'ZEUR');
    if (crypto.length) {
      switch (crypto[0].asset) {
        case 'XETH':
          return 'ETH';
      }
    }
    throw new Error('Canno recognize trade target for ' + JSON.stringify(txo.src));
  }

  amount(txo) {
    if (txo.type !== 'buy' && txo.type !== 'sell') {
      return null;
    }
    const crypto = txo.src.filter((entry) => entry.asset !== 'ZEUR');
    if (crypto.length) {
      return crypto[0].amount;
    }
    throw new Error('Canno recognize amount of trade for ' + JSON.stringify(txo.src));
  }
}

module.exports = new KrakenImport();
