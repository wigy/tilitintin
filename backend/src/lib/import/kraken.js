const Import = require('./base');

class KrakenImport extends Import {

  constructor() {
    super('Kraken');
  }

  load(file) {
    return this.loadCSV(file);
  }

  currency(txo) {
    return 'EUR';
  }

  rate(txo) {
    return 1.0;
  }

  date(entry) {
    return entry.time.substr(0, 10);
  }

  time(entry) {
    return new Date(entry.time).getTime();
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

  total(txo) {
    let total = 0;
    if (txo.type === 'sell') {
      txo.src.forEach((entry) => {
        if (entry.asset === 'ZEUR') {
          total += Math.abs(parseFloat(entry.amount));
        }
      });
    } else {
      txo.src.forEach((entry) => {
        if (entry.asset === 'ZEUR') {
          total += Math.abs(parseFloat(entry.amount));
          total += Math.abs(parseFloat(entry.fee));
        }
      });
    }
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

  tax(txo) {
    return null;
  }

  target(txo) {
    const crypto = txo.src.filter((entry) => entry.asset !== 'ZEUR');
    if (crypto.length) {
      switch (crypto[0].asset) {
        case 'XETH':
          return 'ETH';
        case 'XXBT':
          return 'BTC';
      }
    }
    throw new Error('Cannot recognize trade target for ' + JSON.stringify(txo.src));
  }

  amount(txo) {
    const crypto = txo.src.filter((entry) => entry.asset !== 'ZEUR');
    if (crypto.length) {
      return parseFloat(crypto[0].amount);
    }
    throw new Error('Cannot recognize amount of trade for ' + JSON.stringify(txo.src));
  }
}

module.exports = new KrakenImport();
