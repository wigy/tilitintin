const Import = require('../import');

class NordnetImport extends Import {

  constructor() {
    super('Nordnet');
  }

  // Helper to convert string amount to parseable string.
  num(str) {
    return parseFloat(str.replace(',', '.').replace(/ /g, ''));
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

    return Object.values(ret);
  }

  id(group) {
    return group[0].Vahvistusnumero_Laskelma;
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
    if (types.includes('TALLETUS')) {
      return 'deposit';
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
    let ret = 1.0;
    txo.src.forEach((tx) => {
      if (tx.Valuutta !== 'EUR') {
        ret = this.num(tx.Valuuttakurssi);
      }
    });

    return ret;
  }

  total(txo) {
    let sum = 0;
    if (txo.type === 'fx') {
      txo.src.forEach((tx) => {
        if (tx.Valuutta === 'EUR') {
          sum += Math.abs(this.num(tx.Summa));
        }
      });
    } else {
      txo.src.forEach((tx) => {
        const value = Math.abs(this.num(tx.Summa));
        const rate = Math.abs(this.num(tx.Valuuttakurssi));
        sum += value * rate;
      });
    }
    return Math.round(100 * sum) / 100;
  }

  fee(txo) {
    let sum = 0;
    txo.src.forEach((tx) => {
      const fees = Math.abs(this.num(tx.Maksut));
      const rate = Math.abs(this.num(tx.Valuuttakurssi));
      sum += fees * rate;
    });
    return Math.round(100 * sum) / 100;
  }

  tax(txo) {
    if (txo.type === 'divident') {
      const tax = txo.src.filter((tx) => tx.Tapahtumatyyppi === 'ENNAKKOPID_TYS');
      if (tax.length) {
        let ret = -(this.num(tax[0].Summa));
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
    return txo.src.filter((tx) => this.num(tx.Summa) < 0)[0];
  }

  // Helper to find entry receiving in money.
  _received(txo) {
    return txo.src.filter((tx) => this.num(tx.Summa) > 0)[0];
  }

  amount(txo) {
    let tx = txo.src.filter((tx) => parseInt(tx.M__r_));
    if (!tx.length) {
      return null;
    }
    let sum = parseInt(tx[0].M__r_);
    return txo.type === 'sell' ? -sum : sum;
  }
}

module.exports = new NordnetImport();
