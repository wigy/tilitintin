const Import = require('./base');

class NordnetImport extends Import {

  constructor() {
    super('Nordnet');
  }

  load(file) {
    return this.loadCSV(file, {delimiter: ';'});
  }

  date(entry) {
    return entry.Kirjausp_iv_;
  }

  time(entry) {
    return parseInt(entry.Id);
  }

  grouping(entries) {
    let ret = {};
    entries.forEach((entry) => {
      if (!entry.Vahvistusnumero_Laskelma) {
        return;
      }
      ret[entry.Vahvistusnumero_Laskelma] = ret[entry.Vahvistusnumero_Laskelma] || [];
      ret[entry.Vahvistusnumero_Laskelma].push(entry);
    });

    return Promise.resolve(Object.values(ret));
  }

  recognize(txo) {
    const types = txo.src.map((tx) => tx.Tapahtumatyyppi);
    if (types.includes('OSINKO')) {
      return 'divident';
    }
    throw new Error('Cannot recognize entry of type ' + type + ': ' + JSON.stringify(txo));
  }

  total(txo) {
    let sum = 0;
    txo.src.forEach((tx) => {
      const value = Math.abs(parseFloat(tx.Summa.replace(',', '.')));
      const fees = Math.abs(parseFloat(tx.Maksut.replace(',', '.')));
      const rate = Math.abs(parseFloat(tx.Valuuttakurssi.replace(',', '.')));
      sum += value * rate;
      sum += fees * rate;
    });
    return Math.round(100 * sum) / 100;
  }

  fee(txo) {
    let sum = 0;
    txo.src.forEach((tx) => {
      const fees = Math.abs(parseFloat(tx.Maksut.replace(',', '.')));
      const rate = Math.abs(parseFloat(tx.Valuuttakurssi.replace(',', '.')));
      sum += fees * rate;
    });
    return Math.round(100 * sum) / 100;
  }

  target(txo) {
    const ticker = txo.src[0].Arvopaperi;
    if (!ticker) {
      throw new Error('Cannot recognize target from ' + JSON.stringify(txo));
    }
    return ticker;
  }

  amount(txo) {
    return txo.src.map((tx) => parseInt(tx.M__r_)).reduce((sum, cur) => sum + cur);
  }
}

module.exports = new NordnetImport();
