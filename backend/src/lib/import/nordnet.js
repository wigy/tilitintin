const Import = require('./base');

class NordnetImport extends Import {

  constructor() {
    super('Nordnet');
  }

  load(file) {
    return this.loadCSV(file, {delimiter: ';'});
  }

  trimItem(obj) {
    obj.Tapahtumatyyppi = obj.Tapahtumatyyppi.replace(/\W/g, '_');
    return obj;
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
    if (types.includes('VALUUTAN_OSTO')) {
      return 'fx';
    }
    if (types.includes('MYYNTI')) {
      return 'sell';
    }
    if (types.includes('OSTO')) {
      return 'buy';
    }
    if (types.includes('LAINAKORKO')) {
      return 'interest';
    }
    throw new Error('Cannot recognize entry with types ' + types.join(', ') + ': ' + JSON.stringify(txo));
  }

  currency(txo) {
    let acc = this._received(txo);
    if (!acc) {
      acc = this._given(txo);
    }
    switch (acc.Valuutta) {
      case 'USD':
      case 'EUR':
        return acc.Valuutta;
      default:
       throw new Error('Cannot figure out currency from ' + JSON.stringify(txo));
    }
  }

  rate(txo) {
    return parseFloat(txo.src[0].Valuuttakurssi.replace(',', '.'));
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

  tax(txo) {
    if (txo.type === 'divident') {
      const tax = txo.src.filter((tx) => tx.Tapahtumatyyppi === 'ENNAKKOPID_TYS');
      if (tax.length) {
        let ret = -parseFloat(tax[0].Summa.replace(',', '.'));
        if (txo.rate) {
          ret *= txo.rate;
        }
        return ret;
      }
    }
    return null;
  }

  getAccountForTarget(txo) {
    return this.getAccount('shares');
  }

  target(txo) {
    const ticker = txo.src[0].Arvopaperi;
    if (!ticker) {
      const given = this._given(txo);
      if (given && given.Valuutta) {
        return given.Valuutta;
      }
      throw new Error('Cannot recognize target from ' + JSON.stringify(txo));
    }
    return ticker;
  }

  // Helper to find entry giving out money.
  _given(txo) {
    return txo.src.filter((tx) => parseFloat(tx.Summa.replace(',', '.')) < 0)[0];
  }

  // Helper to find entry receiving in money.
  _received(txo) {
    return txo.src.filter((tx) => parseFloat(tx.Summa.replace(',', '.')) > 0)[0];
  }

  amount(txo) {
    const sum = txo.src.map((tx) => parseInt(tx.M__r_)).reduce((sum, cur) => sum + cur);
    return txo.type === 'sell' ? -sum : sum;
  }
}

module.exports = new NordnetImport();
