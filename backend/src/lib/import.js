const fs = require('fs');
const promiseSeq = require('promise-sequential');
const csv = require('csvtojson');
const path = require('path');
const d = require('neat-dump');
const knex = require('./knex');
const num = require('./num');
const tx = require('./tx');
const data = require('./data');
const text = require('./text');
const meta = require('./meta');
const {TransactionObject} = require('./txo');

/**
 * A base class for importing data files and converting them to the transactions.
 *
 * Process is the following, when calling `import(db, path)`:
 *
 * 1. Preparations are done by fetching necessary data form database with `init()`.
 * 2. File is loaded first with `load(path)`.
 * 3. An array of data is received and is then grouped to arrays forming transactions with `grouping(data)`.
 *    a) Form the groups.
 *    b) Each group ID is generated by `id(group)`.
 *    c) Drop groups that has been imported already.
 * 4. Each group is preprosessed with `preprocess(group)`.
 *    a) By default every item in the group is processed with `trimItem(obj)`.
 * 5. Every source object is transformed to transaction-object, i.e. `txo` with `prepare(obj)`.
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
 *    k) Transaction entries are passed through `checkLoans(entries)` to process automatic loans.
 *    k) The description is constructed with `describe(txobject)`.
 * 7. All transactions are checked and rounding errors are fixed using fixRoundingErrors(list).
 * 8. The list of transaction objects is post-processed in `postprocess(list)`.
 */
class Import {

  constructor(serviceName) {
    // Name of the service.
    this.serviceName = serviceName;
    // Name of the database currenctly in use.
    this.db = null;
    // Latest file imported.
    this.file = null;
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
    return data.getAccountsByNumber(this.db)
      .then((map) => {
        this.accountByNumber = map;
      })
      .then(() => {
        // Get the balances of accounts targeted with loans and loan accounts.
        if (this.config.loans) {
          let needed = [];
          Object.keys(this.config.loans).forEach((name) => {
            if (!this.config.loans[name]) {
              return;
            }
            needed.push(this.config.loans[name]);
            needed.push(this.getAccount(name));
          });
          return Promise.all(needed.map((number) => {
            return this.knex.select(this.knex.raw('SUM(debit * amount) + SUM((debit - 1) * amount) AS total'))
              .from('entry')
              .where({account_id: this.accountByNumber[number]})
              .andWhere('description', '<>', 'Alkusaldo')
              .then((data) => {
                const total = data[0].total || 0;
                d.info('Using balance', num.currency(total, '€'), 'for account', number);
                this.balances[number] = total;
              });
          }));
        }
      })
      .then(() => meta.imports.ensure(this.db));
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
   * Get the account option name for an account number. Loan accounts are prefixed with `loan-`.
   * @param {String} number
   */
  getName(number) {
    let ret = null;
    Object.keys(this.config.accounts).forEach((name) => {
      if (this.config.accounts[name] === number) {
        ret = name;
      }
    });
    if (ret) {
      return ret;
    }
    Object.keys(this.config.loans).forEach((name) => {
      if (this.config.loans[name] === number) {
        ret = 'loan-' + name;
      }
    });
    return ret;
  }

  /**
   * Set the configuration for the importer.
   *
   * @param {Object} config
   *
   * Configuration variables are:
   *   * `accounts.bank` - account number for bank deposits and withdraws
   *   * `accounts.euro` - account number for storing € in the service
   *   * `accounts.crypto` - account number for storing crypto currenccies by default
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
    this.file = file;
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
              line.__lineNumber = lines.length + 1;
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
   * Generate unique transaction ID.
   * @param {Array<Object>} group
   */
  id(group) {
    throw new Error('Importer does not implement id().');
  }

  /**
   * Fallback ID if nothing better available for identifying transactions.
   */
  fileAndLineId(group) {
    let id = path.basename(this.file);
    id += ':';
    id += group.map((group) => group.__lineNumber).sort((a, b) => a-b).join(',');
    return id;
  }

  /**
   * Split input data to groups, generate IDs and drop those already imported.
   * @param {Array<any>} entries
   * @return {Promise<Array<Array<any>>>}
   */
  makeGrouping(entries) {
    return Promise.resolve(this.grouping(entries))
      .then((groups) => {
        // Generate IDs.
        groups.forEach((group, i) => {
          const id = this.id(group);
          if (id===null || id===undefined || /undefined/.test(id)) {
            throw new Error('Invalid ID ' + JSON.stringify(id) + ' generated for a group ' + JSON.stringify(group));
          }
          group.id = id + '';
        });
        return groups;
      })
      .then((groups) => {
        // Filter out entries already in DB.
        const promises = groups.map((group) => () => meta.imports.has(this.db, this.config.service, group.id));
        return promiseSeq(promises)
          .then((results) => {
            return groups.filter((group, i)=> !results[i]);
          });
      });
  }

  /**
   * Update the running balance for the account if it is maintained for loan purposes.
   * @param {String} number
   * @param {Number} amount
   */
  updateBalance(number, amount) {
    // TODO: Update also foreign currencies.
    if (number in this.balances) {
      this.balances[number] += amount;
      // Avoid cumulating rounding error.
      this.balances[number] = Math.round(this.balances[number] * 100) / 100;
      d.info('Updating balance of', number, 'by', num.currency(amount, '€'), 'to', num.currency(this.balances[number], '€'));
    }
  }

  /**
   * Update all balances and update loans for those accounts having loan-counterpart account.
   * @param {Array} entries
   */
  checkLoans(entries) {
    let loanUpdate = [];

    entries.forEach((entry) => {
      // Update balance.
      this.updateBalance(entry.number, entry.amount);
      // Check the loan accounts.
      const name = this.getName(entry.number);
      if (this.config.loans[name]) {
        // If balance negative, make it a loan.
        if (this.balances[entry.number] < 0) {
            const desc = this.tags() + this.serviceName + '-palvelun laina';
          loanUpdate.push({
            number: entry.number,
            amount: Math.round(-100 * this.balances[entry.number]) / 100,
            description: desc
          });
          loanUpdate.push({
            number: this.config.loans[name],
            amount: this.balances[entry.number],
            description: desc
          });
        } else if (this.balances[entry.number] > 0) {
          const loan = -this.balances[this.config.loans[name]];
          const payment = Math.round(100 * Math.min(loan, entry.amount)) / 100;
          if (payment > 0) {
            const desc = this.tags() + this.serviceName + '-palvelun lainan lyhennys';
            loanUpdate.push({
              number: entry.number,
              amount: Math.round(-100 * payment) / 100,
              description: desc
            });
            loanUpdate.push({
              number: this.config.loans[name],
              amount: payment,
              description: desc
            });
          }
        }
      }
    });

    // Update accounts affected by loan entries.
    loanUpdate.forEach((entry) => this.updateBalance(entry.number, entry.amount));

    return entries.concat(loanUpdate);
  }

  /**
   * Find the account number for upkeeping the amount of target owned in euros.
   */
  getAccountForTarget(txo) {
    return this.getAccount(txo.target);
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
   * transaction objects, that contains some of the fields. The second function completes
   * the processing.
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

    // Initialize new targets.
    if (ret.target !== null && this.amounts[ret.target] === undefined) {
      this.amounts[ret.target] = 0.0;
    }
    if (ret.currency !== null && this.amounts[ret.currency] === undefined) {
      this.amounts[ret.currency] = 0.0;
    }
    if (ret.target !== null && this.averages[ret.target] === undefined) {
      this.averages[ret.target] = 0.0;
    }
    if (ret.currency !== null && this.averages[ret.currency] === undefined) {
      this.averages[ret.currency] = 0.0;
    }

    return new TransactionObject(this, ret);
  }

  // Part 2 of processing.
  process(txo) {
    let ret = txo;

    // Calculate amounts and entries.
    if (ret.type !== 'withdrawal' && ret.type !== 'deposit' && ret.type !== 'fx') {
      ret.amount = this.amount(ret);
    }
    ret.tx.entries = txo.entries();

    // Update balances and add loan entries, if needed.
    ret.tx.entries = this.checkLoans(ret.tx.entries);

    /**
     * Helper to maintain averages and totals.
     * @param {String} target
     * @param {Number} newPrice
     * @param {Number} amount
     * @param {Boolean} isBuy
     */
    const updateAvg = (target, newPrice, amount, isBuy) => {
      const oldTotal = this.amounts[target];
      const oldAverage = this.averages[target];
      const oldPrice = oldTotal * oldAverage;
      const newTotal = this.amounts[target] + amount;
      if (isBuy) {
        this.averages[target] = (oldPrice + newPrice) / newTotal;
      }

      ret.targetAverage = this.averages[target];
      ret.targetTotal = newTotal;
    };

    // Update cumulative amounts for trades.
    if (ret.amount !== null && ['buy', 'sell'].includes(ret.type)) {
      updateAvg(ret.target, ret.total - ret.fee, ret.amount, ret.type === 'buy')
      this.amounts[ret.target] += ret.total - ret.fee;
    }

    // Update cumulative amounts for currency exchanges.
    if(ret.type === 'fx') {
      if (ret.target === 'EUR') {
        // Buy currency.
        updateAvg(ret.currency, ret.total - ret.fee, ret.total / ret.rate, true);
      } else {
        throw new Error('Selling currency not implemented.');
      }
    }

    // Construct the text.
    ret.tx.description = this.tags() + txo.describe(ret);

    return ret;
  }

  /**
   * Construct tags prefix for the description if any.
   */
  tags() {
    let ret = '';
    if (this.config.service) {
      ret += '[' + this.config.service + ']';
    }
    if (this.config.fund) {
      ret += '[' + this.config.fund + ']';
    }
    return ret === '' ? '' : ret + ' ';
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
              d.info('Using average', num.currency(desc.avg, '€'), 'for', desc.amount, 'x', desc.target);

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
   * @return {Promise} Promise resolving to the number of entries created.
   */
  import(db, file) {
    this.db = db;
    this.knex = knex.db(db);

    // Helper to sort entries by the date
    const sorter = (a, b) => {
      return this.time(a[0]) - this.time(b[0]);
    };

    return this.init()
      .then(() => this.load(file))
      .then((data) => this.makeGrouping(data))
      .then(data => data.sort(sorter))
      .then((groups) => this.preprocess(groups))
      .then((groups) => groups.map((group => this.prepare(group))))
      .then((txobjects) => this.collectHistory(txobjects))
      .then((txobjects) => txobjects.map((txo => this.process(txo))))
      .then((txobjects) => this.fixRoudingErrors(txobjects))
      .then((txobjects) => this.postprocess(txobjects))
      .then((txobjects) => {
        if (this.config.debug) {
          txobjects.forEach((txo) => {
            console.log('\u001b[33;1m', txo.tx.date, txo.tx.description, '\u001b[0m');
            console.log('           ', txo.type, txo.amount, 'x', txo.target + ',', 'owned:', txo.targetTotal, 'avg.', txo.targetAverage, '(', txo.currency, txo.rate + '€', 'tax', txo.tax, 'fee', txo.fee, 'rate', txo.rate, ')');
            txo.tx.entries.forEach((entry) => {
              console.log('           \u001b[33m', entry.number, '\u001b[0m', entry.amount, '\t', entry.description || '');
            });
          });
        }
        return txobjects;
      })
      .then((txobjects) => {
        if (!this.config.dryRun) {
          const creators = txobjects.map((txo) => () => {
            return tx.add(db, txo.tx.date, txo.tx.description, txo.tx.entries, {force: true})
              .then((docId) => meta.imports.add(this.db, this.config.service, txo.src.id, docId))
              .catch((err) => {
                d.error(txo.tx);
                d.error(err);
              });
          });
          d.info('Saving', creators.length, 'entries.');
          return promiseSeq(creators);
        } else {
          return 0;
        }
      });
  }
}

module.exports = Import;
