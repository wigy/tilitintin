const num = require('./num');

/**
 * A class storing piece of imported data and the transaction deducted from it.
 */
class TransactionObject {

  constructor(importer, data) {
    this.importer = importer;
    Object.assign(this, data);
  }

  /**
   * Helper to show most important data.
   */
  toString() {
    return JSON.stringify({
      type: this.type,
      total: this.total,
      target: this.target,
      currency: this.currency,
      rate: this.rate,
      amount: this.amount,
      targetAverage: this.targetAverage,
      targetTotal: this.targetTotal,
      fee: this.fee,
      tax: this.tax,
      tx: this.tx,
    });
  }

  /**
   * Construct entries for the transaction.
   *
   * @return {Array<Object>}
   */
  entries() {
    const fn = this.type + 'Entries';
    if (!this[fn]) {
      throw new Error('Importer does not implement ' + fn + '().');
    }
    let ret = this[fn]();
    if (!(ret instanceof Array)) {
      throw new Error('The function ' + fn + '() did not return an array for ' + JSON.stringify(this.type));
    }
    return ret;
  }

  /**
   * Create deposit entries.
   */
  depositEntries() {
    // Fees
    if (this.fee) {
      const amount = Math.round((this.total - this.fee) * 100) / 100;
      return [
        {number: this.importer.getAccount(this.currency), amount: amount},
        {number: this.importer.getAccount('fees'), amount: this.fee},
        {number: this.importer.getAccount('bank'), amount: -this.total},
      ];
    }
    // No fees
    return [
      {number: this.importer.getAccount(this.currency), amount: this.total},
      {number: this.importer.getAccount('bank'), amount: -this.total},
    ];
  }

  /**
   * Create withdrawal entries.
   */
  withdrawalEntries() {
    if (this.fee) {
      return [
        {number: this.importer.getAccount('bank'), amount: Math.round((this.total - this.fee) * 100) / 100},
        {number: this.importer.getAccount('fees'), amount: this.fee},
        {number: this.importer.getAccount(this.currency), amount: -this.total},
      ];
    }
    return [
      {number: this.importer.getAccount('bank'), amount: this.total},
      {number: this.importer.getAccount(this.currency), amount: -this.total},
    ];
  }

  /**
   * Create buying entries.
   */
  buyEntries() {
    let ret = [
      {number: this.importer.getAccountForTarget(this), amount: Math.round((this.total - this.fee) * 100) / 100},
      {number: this.importer.getAccount('fees'), amount: this.fee},
      {number: this.importer.getAccount(this.currency), amount: -this.total},
    ];
    return ret;
  }

  /**
   * Create selling entries.
   */
  sellEntries() {
    const amount = Math.round((this.total - this.fee) * 100) / 100;
    let ret = [
      {number: this.importer.getAccount(this.currency), amount: amount},
      {number: this.importer.getAccount('fees'), amount: this.fee},
    ];

    const avgPrice = this.importer.averages[this.target] || 0;
    const buyPrice = avgPrice ? Math.round(100 * (-this.amount) * avgPrice) / 100 : this.total;

    if (this.importer.config.noProfit) {
      // In case of not calculating profits yet, put in only buy price.
      ret.push({number: this.importer.getAccountForTarget(this), amount: -this.total});
    } else {
      // Otherwise calculate losses or profits from the average price.
      const diff = Math.round((buyPrice - this.total) * 100) / 100;
      if (diff > 0) {
        // In losses, add to debit side into losses.
        ret.push({number: this.importer.getAccount('losses'), amount: diff});
        ret.push({number: this.importer.getAccountForTarget(this), amount: -buyPrice});
      } else if (diff < 0) {
        // In profits, add to credit side into profits
        ret.push({number: this.importer.getAccount('profits'), amount: diff});
        ret.push({number: this.importer.getAccountForTarget(this), amount: -buyPrice});
      } else {
        ret.push({number: this.importer.getAccountForTarget(this), amount: -this.total});
      }
    }
    return ret;
  }

  /**
   * Create divident entries.
   */
  dividentEntries() {
    const acc = this.importer.getAccount(this.currency);
    let ret = [
      {number: this.importer.getAccount('dividents'), amount: Math.round(-100 * this.total) / 100},
    ];
    if (this.tax) {
      const tax = Math.round(this.tax * 100) / 100;
      const acc = this.currency === 'EUR' ? this.importer.getAccount('tax') : this.importer.getAccount('srctax');
      const amount = Math.round(100 * (this.total - tax)) / 100;
      ret.push({number: this.importer.getAccount(this.currency), amount: amount});
      ret.push({number: acc, amount: tax});
    } else {
      ret.push({number: this.importer.getAccount(this.currency), amount: this.total});
    }
    return ret;
  }

  /**
   * Create foreign exchange entries.
   */
  fxEntries() {
    let neg = Math.round(-100 * this.total) / 100;
    let ret = [
      {number: this.importer.getAccount(this.currency), amount: this.total},
      {number: this.importer.getAccount(this.target), amount: neg},
    ];
    return ret;
  }

  /**
   * Create interest payment entries.
   */
  interestEntries() {
    const amount = Math.round(-100 * this.total) / 100;
    let ret = [
      {number: this.importer.getAccount(this.currency), amount: amount},
      {number: this.importer.getAccount('interest'), amount: this.total},
    ];
    return ret;
  }

  /**
   * Construct the description for the transaction.
   *
   * @return {string}
   */
  describe() {
    let parenthesis = [];
    switch(this.type) {
      case 'deposit':
        return 'Talletus ' + this.importer.serviceName + '-palveluun';
      case 'withdrawal':
        return 'Nosto ' + this.importer.serviceName + '-palvelusta';
      case 'buy':
        parenthesis = ['yht. ' + num.trim(this.targetTotal, this.target)];
        if (!this.importer.config.noProfit) {
          parenthesis.push('k.h. nyt ' + num.currency(this.targetAverage, '€/'  + this.target));
        }
        return 'Osto ' + num.trimSigned(this.amount, this.target) + ' (' + parenthesis.join(', ')  + ')';
      case 'sell':
        if (!this.importer.config.noProfit) {
          parenthesis.push('k.h. ' + num.currency(this.targetAverage, '€/'  + this.target));
        }
        parenthesis.push('jälj. ' + num.trim(this.targetTotal, this.target));
        return 'Myynti ' + num.trimSigned(this.amount, this.target) + ' (' + parenthesis.join(', ') + ')';
      case 'divident':
        parenthesis.push(this.amount + ' x ' + num.currency(this.total / this.amount / this.rate, this.currency, 5) + ' = ' + num.currency(this.total / this.rate, this.currency));
        if (this.tax) {
          parenthesis.push('vero ' + num.currency(this.tax / this.rate, this.currency) + ' = ' + num.currency(this.tax, '€'));
        }
        if (this.currency !== 'EUR') {
          parenthesis.push('kurssi ' + num.currency(this.rate, this.currency + '/€', 4));
        }
        return 'Osinko ' + this.target + ' (' + parenthesis.join(', ') + ')';
      case 'fx':
        parenthesis.push('kurssi ' + num.currency(this.rate, this.currency + '/' + this.target, 4));
        return 'Valuutanvaihto ' + this.target + ' -> ' + this.currency + ' (' + parenthesis.join(', ') + ')';
      case 'interest':
        return this.importer.serviceName + ' lainakorko';
      default:
        throw new Error('Cannot describe transaction of type ' + this.type);
    }
  }
}

module.exports = {
  TransactionObject: TransactionObject
};
