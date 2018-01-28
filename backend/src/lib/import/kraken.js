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

    throw new Error('Cannot recognize entry ' + JSON.stringify(txo));
  }

  date(txo) {
    return txo.src[0].time.substr(0, 10);
  }

  total(txo) {
    // TODO: Improve handling for further transaction types.
    let total = 0;
    txo.src.forEach((entry) => {
      if (entry.asset === 'ZEUR') {
        total += Math.abs(parseFloat(entry.amount));
        total += Math.abs(parseFloat(entry.fee));
      }
    });
    return total;
  }
}

module.exports = new KrakenImport();
