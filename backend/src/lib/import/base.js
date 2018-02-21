const fs = require('fs');
const promiseSeq = require('promise-sequential');
const knex = require('../knex');
const csv = require('csvtojson');
const num = require('../num');
const tx = require('../tx');
const data = require('../data');
const text = require('../text');

/**
 * A base class for importing data files and converting them to the transactions.
 *
 * Process is the following, when calling `import(db, path)`:
 *
 * 1. Preparations are done by fetching necessary data form database with `init()`.
 * 2. File is loaded first with `load(path)`.
 * 3. An array of data is received and is then grouped to arrays forming transactions with `grouping(data)`.
 * 4. Each group is preprosessed with `preprocess(group)`.
 *    a) By default every item in the group is processed with `trimItem(obj)`.
 * 5. Every source object is transformed to tx-object with `prepare(obj)`.
 * 6. Each group is converted to the transaction objects in `process(group)`.
 *    a) Date is resolved with `date(txobject)`.
 *    b) Each group is classified to transaction type using `recognize(txobject)`.
 *    c) Main currency of the transaction is found out with `currency(txobject)`.
 *    d) Currency exchange rate, where applicapable, is taken with `rate(txobject)`.
 *    e) Total amount is resolved with `total(txobject)`.
 *    f) Find the target of the trade if any `target(txobject)`.
 *    g) Find the service fee in euros `fee(txobject)`.
 *    h) Find the amount of tax in euros `tax(txobject)`.
 *    i) Find the amonunt of the target in the trade if any `amount(txobject)`.
 *    j) Construct entries for transaction with `entries(txobject)`.
 *       - Based on the type, the function `<type>Entries(txobject)` is called.
 *    k) The description is constructed with `describe(txobject)`.
 * 7. All transactions are checked and rounding errors are fixed using fixRoundingErrors(list).
 * 8. The list of transaction objects is post-processed in `postprocess(list)`.
 */
class Import {

  constructor(serviceName) {
    // Name of the service.
    this.serviceName = serviceName;
    // Name of the database currently in use.
    this.db = null;
    // Knex instance for accessing DB.
    this.knex = null;
    // Configuration variables.
    this.config = {};
    // Running totals of each trade target owned.
    this.amounts = {};
    // Tunning totals of the average cost of each trade target in euros.
    this.averages = {};
    // Running balances of accounts using a loan.
    this.balances = {};
    // Mapping from account numbers to account IDs.
    this.accountByNumber = {};
  }

  /**
   * Make preparations for import.
   */
  init() {
    this.amounts = {};
    this.averages = {};
    this.balances = {};

    // Fill in account numbers.
    return this.knex.select('id', 'number')
      .from('account')
      .then((data) => {
        data.forEach((account) => this.accountByNumber[account.number] = account.id);
      })
      .then(() => {
        // Get the balances of accounts targeted with loans.
        if (this.config.loans) {
          return Promise.all(Object.keys(this.config.loans).map((name) => {
            const number = this.getAccount(name);
            return this.knex.select(this.knex.raw('SUM(debit * amount) + SUM((debit - 1) * amount) AS total'))
              .from('entry')
              .where({account_id: this.accountByNumber[number]})
              .then((data) => {
                console.log('Using balance', num.currency(data[0].total, '€'), 'for account', number);
                this.balances[number] = data[0].total;
              });
          }));
        }
      });
  }

  /**
   * Resolve account number based on its purpose.
   * @param {string} name Account purpose (see `configure()`).
   * @return {string} Number of the account.
   */
  getAccount(name) {
    name = name.toLowerCase();
    if (this.config.accounts[name]) {
      return this.config.accounts[name];
    }
    if(['eth', 'btc'].includes(name) && this.config.accounts.crypto) {
      return this.config.accounts.crypto;
    }
    throw new Error('The account number `' + name + '` is not configured.');
  }

  /**
   * Set the configuration for the importer.
   *
   * @param {Object} config
   *
   * Configuration variables are:
   *   * `accounts.bank` - account number for bank deposits and withdraws
   *   * `accounts.euro` - account number for storing € in the service
   *   * `accounts.crypto` - account number for storing crypto currencies by default
   *   * `accounts.eth` - account number for storing ETH
   *   * `accounts.btc` - account number for  storing BTC
   *   * `accounts.rounding` - account number for trimming transaction rounding errors
   */
  configure(config) {
    this.config = config;
  }

  /**
   * Read in the data from the file and store it internally.
   * @param {string} file A path to the file.
   * @return {Promise<any>} Promise resolving to the parsed data.
   */
  load(file) {
    throw new Error('Importer does not implement load().');
  }

  /**
   * Get the date from the original entry.
   * @param {Object} entry Original data entry.
   * @return {string} the date in YYYY-MM-DD format.
   */
  date(entry) {
    throw new Error('Importer does not implement date().');
  }

  /**
   * Get the more accurate time from the original entry useful for sorting.
   * @param {Object} entry Original data entry.
   * @return {number} A number that can be compared, when sorting entries.
   */
  time(entry) {
    throw new Error('Importer does not implement time().');
  }

  /**
   * Reorganize entries so that they are grouped to the arrays forming one single transaction.
   *
   * @param {Array<any>} entries
   * @return {Promise<Array<Array<any>>>}
   */
  grouping(entries) {
    throw new Error('Importer does not implement grouping().');
  }

  /**
   * Construct entries for the transaction.
   *
   * @param {Object} txo An transaction object.
   * @return {Array<Object>}
   */
  entries(txo) {
    const fn = txo.type + 'Entries';
    if (!this[fn]) {
      throw new Error('Importer does not implement ' + fn + '().');
    }
    let ret = this[fn](txo);
    if (!(ret instanceof Array)) {
      throw new Error('The function ' + fn + '() did not return an array for ' + JSON.stringify(txo));
    }
    return ret;
  }

  /**
   * Create deposit entries.
   */
  depositEntries(txo) {
    if (txo.fee) {
      return [
        {number: this.getAccount(txo.curreny), amount: Math.round((txo.total - txo.fee) * 100) / 100},
        {number: this.getAccount('fees'), amount: txo.fee},
        {number: this.getAccount('bank'), amount: -txo.total},
      ];
    }
    return [
      {number: this.getAccount(txo.curreny), amount: txo.total},
      {number: this.getAccount('bank'), amount: -txo.total},
    ];
  }

  /**
   * Create withdrawal entries.
   */
  withdrawalEntries(txo) {
    if (txo.fee) {
      return [
        {number: this.getAccount('bank'), amount: Math.round((txo.total - txo.fee) * 100) / 100},
        {number: this.getAccount('fees'), amount: txo.fee},
        {number: this.getAccount(txo.curreny), amount: -txo.total},
      ];
    }
    return [
      {number: this.getAccount('bank'), amount: txo.total},
      {number: this.getAccount(txo.curreny), amount: -txo.total},
    ];
  }

  /**
   * Create buying entries.
   */
  buyEntries(txo) {
    let ret = [
      {number: this.getAccountForTarget(txo), amount: Math.round((txo.total - txo.fee) * 100) / 100},
      {number: this.getAccount('fees'), amount: txo.fee},
      {number: this.getAccount(txo.currency), amount: -txo.total},
    ];

    return ret;
  }

  /**
   * Find the account number for upkeeping the amount of target owned in euros.
   */
  getAccountForTarget(txo) {
    return this.getAccount(txo.target);
  }

  /**
   * Create selling entries.
   */
  sellEntries(txo) {
    let ret = [
      {number: this.getAccount(txo.currency), amount: Math.round((txo.total - txo.fee) * 100) / 100},
      {number: this.getAccount('fees'), amount: txo.fee},
    ];

    const avgPrice = this.averages[txo.target] || 0;
    const buyPrice = avgPrice ? Math.round(100 * (-txo.amount) * avgPrice) / 100 : txo.total;

    if (this.config.noProfit) {
      // In case of not calculating profits yet, put in only buy price.
      ret.push({number: this.getAccountForTarget(txo), amount: -txo.total});
    } else {
      // Otherwise calculate losses or profits from the average price.
      const diff = Math.round((buyPrice - txo.total) * 100) / 100;
      if (diff > 0) {
        // In losses, add to debit side into losses.
        ret.push({number: this.getAccount('losses'), amount: diff});
        ret.push({number: this.getAccountForTarget(txo), amount: -buyPrice});
      } else if (diff < 0) {
        // In profits, add to credit side into profits
        ret.push({number: this.getAccount('profits'), amount: diff});
        ret.push({number: this.getAccountForTarget(txo), amount: -buyPrice});
      } else {
        ret.push({number: this.getAccountForTarget(txo), amount: -txo.total});
      }
    }
    return ret;
  }

  /**
   * Create divident entries.
   */
  dividentEntries(txo) {
    const acc = this.getAccount(txo.currency);
    let ret = [
      {number: this.getAccount('dividents'), amount: Math.round(-100 * txo.total) / 100},
    ];
    if (txo.tax) {
      const tax = Math.round(txo.tax * 100) / 100;
      const acc = txo.currency === 'EUR' ? this.getAccount('tax') : this.getAccount('srctax');
      ret.push({number: this.getAccount(txo.currency), amount: Math.round(100 * (txo.total - tax)) / 100});
      ret.push({number: acc, amount: tax});
    } else {
      ret.push({number: this.getAccount(txo.currency), amount: txo.total});
    }
    return ret;
  }

  /**
   * Create foreign exchange entries.
   */
  fxEntries(txo) {
    let ret = [
      {number: this.getAccount(txo.currency), amount: txo.total},
      {number: this.getAccount(txo.target), amount: Math.round(-100 * txo.total) / 100},
    ];
    return ret;
  }

  /**
   * Create interest payment entries.
   */
  interestEntries(txo) {
    let ret = [
      {number: this.getAccount(txo.currency), amount: Math.round(-100 * txo.total) / 100},
      {number: this.getAccount('interest'), amount: txo.total},
    ];
    return ret;
  }

  /**
   * Construct the description for the transaction.
   *
   * @param {Object} txo An transaction object.
   * @return {string}
   */
  describe(txo) {
    let parenthesis = [];
    switch(txo.type) {
      case 'deposit':
        return 'Talletus ' + this.serviceName + '-palveluun';
      case 'withdrawal':
        return 'Nosto ' + this.serviceName + '-palvelusta';
      case 'buy':
        parenthesis = ['yht. ' + num.trim(txo.targetTotal, txo.target)];
        if (!this.config.noProfit) {
          parenthesis.push('k.h. nyt ' + num.currency(txo.targetAverage, '€/'  + txo.target));
        }
        return 'Osto ' + num.trim(txo.amount, txo.target) + ' (' + parenthesis.join(', ')  + ')';
      case 'sell':
        if (!this.config.noProfit) {
          parenthesis.push('k.h. ' + num.currency(txo.targetAverage, '€/'  + txo.target));
        }
        parenthesis.push('jälj. ' + num.trim(txo.targetTotal, txo.target));
        return 'Myynti ' + num.trim(txo.amount, txo.target) + ' (' + parenthesis.join(', ') + ')';
      case 'divident':
        parenthesis.push(txo.amount + ' x ' + num.currency(txo.total / txo.amount / txo.rate, txo.currency, 5) + ' = ' + num.currency(txo.total / txo.rate, txo.currency));
        if (txo.tax) {
          parenthesis.push('vero ' + num.currency(txo.tax / txo.rate, txo.currency) + ' = ' + num.currency(txo.tax, '€'));
        }
        if (txo.currency !== 'EUR') {
          parenthesis.push('kurssi ' + num.currency(txo.rate, txo.currency + '/€'));
        }
        return 'Osinko ' + txo.target + ' (' + parenthesis.join(', ') + ')';
      case 'fx':
        parenthesis.push('kurssi ' + num.currency(txo.rate, txo.currency + '/' + txo.target));
        return 'Valuutanvaihto ' + txo.target + ' -> ' + txo.currency + ' (' + parenthesis.join(', ') + ')';
      case 'interest':
        return this.serviceName + ' lainakorko';
      default:
        throw new Error('Cannot describe transaction of type ' + txo.type);
    }
  }

  /**
   * Calculate transaction total as positive number.
   *
   * @param {Object} txo An transaction object.
   * @return {Number}
   */
  total(txo) {
    throw new Error('Importer does not implement total().');
  }

  /**
   * Find out currency as 'EUR' or 'USD'.
   *
   * @param {Object} txo An transaction object.
   * @return {String}
   */
  currency(txo) {
    throw new Error('Importer does not implement currency().');
  }

  /**
   * Find out currency conversion rate to €.
   *
   * @param {Object} txo An transaction object.
   * @return {Number}
   */
  rate(txo) {
    throw new Error('Importer does not implement rate().');
  }

  /**
   * Look up for the trade target
   *
   * @param {Object} txo An transaction object.
   * @return {string}
   */
  target(txo) {
    throw new Error('Importer does not implement target().');
  }

  /**
   * Look up for the amount of the target to trade.
   *
   * @param {Object} txo An transaction object.
   * @return {Number} Amount traded.
   */
  amount(txo) {
    throw new Error('Importer does not implement amount().');
  }

  /**
   * Look up for the service fee.
   *
   * @param {Object} txo An transaction object.
   * @return {Number} Service fee.
   */
  fee(txo) {
    throw new Error('Importer does not implement fee().');
  }

  /**
   * Look up for the tax.
   *
   * @param {Object} txo An transaction object.
   * @return {Number} Amount of tax deducted.
   */
  tax(txo) {
    throw new Error('Importer does not implement tax().');
  }

  /**
   * Pre-processing hook.
   * @param {<Array<Object>} list A list of objects read from the file.
   */
  preprocess(list) {
    for (let i=0; i < list.length; i++) {
      for (let j=0; j < list[i].length; j++) {
        list[i][j] = this.trimItem(list[i][j]);
      }
    }
    return list;
  }

  /**
   * Pre-process imported data object.
   */
  trimItem(obj) {
    return obj;
  }

  /**
   * Post-processing hook.
   * @param {Array} lits All transaction objects.
   */
  postprocess(list) {
    return list;
  }

  /**
   * Recognize the type of the transaction.
   *
   * @param {Object} txo An transaction object.
   * @return {string} One of the 'deposit', 'withdrawal', 'sell', 'buy', 'divident', 'fx', 'interest'.
   *
   * Currency exchange type is 'fx' and `currency` is currency received while `target` is currency given.
   */
  recognize(txo) {
    throw new Error('Importer does not implement recognize().');
  }

  /**
   * Process a group of original entries to the transaction data.
   *
   * @param {Array<any>} group
   * @return {Array<Object>}
   *
   * The processed entries are objects that contain properties:
   *   * `src` - original entry data
   *   * `type` - A classification of the transaction (see recognize()).
   *   * `total` - Total amount of the transaction, i.e. abs of debit/credit.
   *   * `target` - Name of the target in the trade (like 'ETH', 'BTC' or 'GOOG').
   *   * `currency` - Name of the currency used in the transaction (like 'EUR' or 'USD')
   *   * `rate` - Conversion rate to € for currency.
   *   * `amount` - Amount of the target to trade or shares owned for divident.
   *   * `targetAverage` - Average price of the target after the transaction.
   *   * `targetTotal` - Number of targets owned after the transaction.
   *   * `fee` - Service fee in euros.
   *   * `tax` - Amount of tax deducted.
   *   * `tx.date`- a transaction date
   *   * `tx.description` - a transaction description
   *   * `tx.entries` - a list of transaction entries
   *
   * Two functions are used. Prepare is called first. It converts original data objects to
   * transaction objects, that contains some of the fields.
   */
  prepare(group) {

    // Initial template for txo.
    let ret = {
      src: group,
      type: null,
      total: null,
      target: null,
      currency: null,
      rate: null,
      amount: null,
      targetAverage: null,
      targetTotal: null,
      fee: null,
      tax: null,
      tx: {
        date: null,
        description: null,
        entries: []
      }
    };
    // Get basics.
    ret.tx.date = this.date(group[0]);
    ret.type = this.recognize(ret);
    ret.currency = this.currency(ret);
    ret.rate = this.rate(ret);
    ret.total = this.total(ret);
    ret.fee = this.fee(ret);
    ret.tax = this.tax(ret);
    if (ret.type !== 'withdrawal' && ret.type !== 'deposit') {
      ret.target = this.target(ret);
    }

    return ret;
  }
  process(txo) {
    let ret = txo;

    // Calculate amounts and entries.
    if (ret.type !== 'withdrawal' && ret.type !== 'deposit' && ret.type !== 'fx') {
      ret.amount = this.amount(ret);
    }
    ret.tx.entries = this.entries(ret);

    // Update cumulative amounts.
    if (ret.amount !== null && ['buy', 'sell'].includes(ret.type)) {
      const oldTotal = this.amounts[ret.target];
      const oldAverage = this.averages[ret.target];
      const oldPrice = oldTotal * oldAverage;
      const newPrice = ret.total - ret.fee;
      this.amounts[ret.target] += ret.amount;
      const newTotal = this.amounts[ret.target];
      if (ret.type === 'buy') {
        this.averages[ret.target] = (oldPrice + newPrice) / newTotal;
      }
      ret.targetAverage = this.averages[ret.target];
      ret.targetTotal = newTotal;
    }

    let tags = '';
    if (this.config.service) {
      tags += '[' + this.config.service + ']';
    }
    if (this.config.fund) {
      tags += '[' + this.config.fund + ']';
    }
    ret.tx.description = (tags ? tags + ' ' : '') + this.describe(ret);

    return ret;
  }

  /**
   * Scan for rouding errors in transactions and fix them.
   *
   * @param {Array<Object>} list All transaction objects.
   */
  fixRoudingErrors(list) {
    list.forEach((item, i) => {
      let err = Math.round(100 * list[i].tx.entries.reduce((sum, entry) => sum + entry.amount, 0)) / 100;
      if (err !== 0) {
        item.tx.entries.push({number: this.getAccount('rounding'), amount: -err});
      }
    });
    return list;
  }

  /**
   * A loader for CSV file.
   *
   * @param {string} file A path to the file.
   * @param {Object} opts Options for CSV-reader.
   * @return {Promise<Array<Object>>}
   *
   * The first row is assumed to have headers and they are used to construct
   * an array of objects containing each row as members defined by the first header row.
   * Special option `headers` can be given as an explicit list of headers.
   */
  loadCSV(file, opts = {}) {
    return new Promise((resolve, reject) => {

      let headers = null;
      opts.noheader = true;

      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        data = data.toString();
        let lines = [];

        csv(opts)
          .fromString(data)
          .on('csv',(row) => {
            if (headers === null) {
              headers = opts.headers || row.map(r => r.replace(/\W/g, '_'));
            } else {
              let line = {};
              for (let i = 0; i < row.length; i++) {
                line[headers[i]] = row[i];
              }
              lines.push(line);
            }
          })
          .on('done',()=>{
            resolve(lines);
          });
      });
    });
  }

  /**
   * Collect targets and find out their historical data, i.e. amounts owned and average prices.
   */
  collectHistory(txobjects) {
    if (this.config.noProfit) {
      return txobjects;
    }
    let targets = {};
    txobjects.forEach((txo) => {if (['buy', 'sell', 'divident'].includes(txo.type)) targets[txo.target]=true;});

    return this.knex.select('description')
      .from('entry')
      .where('description', 'LIKE', '%[' + this.config.service  + ']%k.h.%')
      .leftJoin('document', 'entry.document_id', 'document.id').orderBy('date', 'desc')
      .then((data) => {
        for (let i=0; i < data.length; i++) {
          const desc = text.parse(data[i].description);
          if (desc.target && targets[desc.target]) {
            if (!this.averages[desc.target] && desc.avg) {
              this.averages[desc.target] = desc.avg;
              this.amounts[desc.target] = desc.amount;
              console.log('Using average', num.currency(desc.avg, '€'), 'for', desc.amount, 'x', desc.target);

              delete targets[desc.target];
              if (!Object.keys(targets).length) {
                return txobjects;
              }
            }
          }
        }
        return txobjects;
      });
  }

  /**
   * Handler for importing.
   *
   * @param {string} db Name of the database.
   * @param {string} file A path to the file to be imported.
   * @param {boolean} dryRun If set, do not store but show on console instead.
   * @return {Promise} Promise resolving to the number of entries created.
   */
  import(db, file, dryRun) {
    this.db = db;
    this.knex = knex.db(db);

    // Helper to sort entries by the date
    const sorter = (a, b) => {
      return this.time(a[0]) - this.time(b[0]);
    };

    return this.init()
      .then(() => this.load(file))
      .then((data) => this.grouping(data))
      .then(data => data.sort(sorter))
      .then((groups) => this.preprocess(groups))
      .then((groups) => groups.map((group => this.prepare(group))))
      .then((txobjects) => this.collectHistory(txobjects))
      .then((txobjects) => txobjects.map((txo => this.process(txo))))
      .then((txobjects) => this.fixRoudingErrors(txobjects))
      .then((txobjects) => this.postprocess(txobjects))
      .then((txobjects) => {
        if (dryRun) {
          txobjects.forEach((txo) => {
            console.log('\u001b[33;1m', txo.tx.date, txo.tx.description, '\u001b[0m');
            console.log('           ', txo.type, txo.amount, 'x', txo.target + ',', 'owned:', txo.targetTotal, 'avg.', txo.targetAverage, '(', txo.currency, txo.rate + '€', 'tax', txo.tax, 'fee', txo.fee, ')');
            txo.tx.entries.forEach((entry) => {
              console.log('           \u001b[33m', entry.number, '\u001b[0m', entry.amount);
            });
          });
        }
        return txobjects;
      })
      .then((txobjects) => {
        if (!dryRun) {
          const creators = txobjects.map((txo) => () => tx.add(db, txo.tx.date, txo.tx.description, txo.tx.entries));
          console.log('Saving', creators.length, 'entries.');
          return promiseSeq(creators);
        } else {
          return 0;
        }
      });
  }
}

module.exports = Import;
