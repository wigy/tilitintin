const Import = require('../import');

class GDAXImport extends Import {

  constructor() {
    super('GDAX');
  }

  load(file) {
    return this.loadCSV(file);
  }

  grouping(entries) {
    let ret = {};
    entries.forEach((entry) => {
      let key = entry.trade_id;
      if (['deposit', 'withdrawal'].includes(entry.type)) {
        key = entry.transfer_id;
      }
      if (!key) {
        throw new Error('No key found from ' + JSON.stringify(entries));
      }
      ret[key] = ret[key] || [];
      ret[key].push(entry);
    });

    return Object.values(ret);
  }

  id(group) {
    return group[0].trade_id || group[0].transfer_id;
  }

  time(entry) {
    return new Date(entry.time).getTime();
  }

  date(entry) {
    return entry.time.substr(0, 10);
  }

  recognize(txo) {
    if (txo.src.length === 1) {
      if (['deposit', 'withdrawal'].includes(txo.src[0].type)) {
        if (txo.src[0].amount_balance_unit === 'EUR') {
          return txo.src[0].type;
        }
        return parseFloat(txo.src[0].amount) > 0 ? 'in' : 'out';
      }
    } else {
      const matches = this._srcType(txo, 'match');
      if (matches) {
        const eur = this._srcType(txo, 'match', 'EUR');
        if (eur) {
          return parseFloat(eur.amount) > 0 ? 'sell' : 'buy';
        }
      }
    }

    throw new Error('Cannot recognize entry ' + JSON.stringify(txo.src));
  }

  currency(txo) {
    return 'EUR';
  }

  rate(txo) {
    return 1.0;
  }

  total(txo) {
    let eur, fee;
    let total = 0;
    switch(txo.type) {
      case 'in':
      case 'out':
        return null;
      case 'buy':
        eur = this._srcType(txo, 'match', 'EUR');
        total += parseFloat(eur[0].amount);
        fee = this._srcType(txo, 'fee', 'EUR');
        if (fee) {
          total += -parseFloat(fee[0].amount);
        }
        break;
      case 'deposit':
        eur = this._srcType(txo, 'deposit', 'EUR');
        total = parseFloat(eur[0].amount);
        break;
      case 'withdrawal':
        eur = this._srcType(txo, 'withdrawal', 'EUR');
        total = -parseFloat(eur[0].amount);
        break;
      default:
        throw new Error('No total() implemented for ' + JSON.stringify(txo.src));
    }
    return Math.round(100 * total) / 100;
  }

  fee(txo) {
    const fee = this._srcType(txo, 'fee');
    if (fee) {
      if (fee[0].amount_balance_unit !== 'EUR') {
        throw new Error('Cannot handle non-EUR fees ' + JSON.stringify(txo.src));
      }
      return Math.round(-100 * parseFloat(fee[0].amount)) / 100;
    }
    return 0;
  }

  tax(txo) {
    return null;
  }

  target(txo) {
    if (txo.src.length === 1) {
      return txo.src[0].amount_balance_unit;
    }
    const fee = this._srcType(txo, 'fee');
    if ((fee && txo.src.length === 3) || (!fee && txo.src.length === 2)) {
      const other = txo.src.filter((tx) => tx.amount_balance_unit !== 'EUR');
      if (other) {
        return other[0].amount_balance_unit;
      }
    }
    throw new Error('Cannot find target from ' + JSON.stringify(txo.src));
  }

  amount(txo) {
    const other = txo.src.filter((tx) => tx.amount_balance_unit !== 'EUR');
    switch(txo.type) {
      case 'in':
      case 'out':
        if (other) {
          return parseFloat(other[0].amount);
        }
        break;
      case 'buy':
        if (other) {
          return parseFloat(other[0].amount);
        }
        break;
      default:
        throw new Error('No amount() implemented for ' + txo.type + '-type ' + JSON.stringify(txo.src));
    }
  }

  // Helper to find src entries of given type (and optionally given unit).
  _srcType(txo, type, unit=null) {
    const matches = txo.src.filter((tx) => tx.type === type && (unit === null || tx.amount_balance_unit === unit));
    return matches.length ? matches : null;
  }
}

module.exports = new GDAXImport();
