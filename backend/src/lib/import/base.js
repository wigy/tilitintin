const fs = require('fs');
const promiseSeq = require('promise-sequential');
const knex = require('../knex');
const csv = require('csvtojson');
const num = require('../num');
const tx = require('../tx');
const data = require('../data');

/**
 * A base class for importing data files and converting them to the transactions.
 *
 * Process is the following, when calling `import(db, path)`:
 *
 * 1. Preparations are done by fetching necessary data form database with `init()`.
 * 2. File is loaded first with `load(path)`.
 * 3. An array of data is received and is then grouped to arrays forming transactions with `grouping(data)`.
 * 4. Each group is preprosessed with `preprocess(group)`.
 * 5. Each group is converted to the transaction objects in `process(group)`.
 *    a) Each group is classified to transaction type using `recognize(txobject)`.
 *    b) Date is resolved with `date(txobject)`.
 *    c) Total amount is resolved with `total(txobject)`.
 *    d) Find the target of the trade if any `target(txobject)`.
 *    e) Find the amonunt of the target in the trade if any `amount(txobject)`.
 *    f) Find the service fee in euros `fee(txobject)`.
 *    g) Construct entries for transaction with `entries(txobject)`.
 *       - Based on the type, the function `<type>Entries(txobject)` is called.
 *    h) The description is constructed with `describe(txobject)`.
 * 6. All transactions are checked and rounding errors are fixed using fixRoundingErrors(list).
 * 7. The list of transaction objects is post-processed in `postprocess(list)`.
 */
class Import {

  constructor(serviceName) {
    // Name of the service.
    this.serviceName = serviceName;
    // Name of the database currently in use.
    this.db = null;
    // Configuration variables.
    this.config = {};
    // Running totals of each trade target owned.
    this.amounts = {};
    // Tunning totals of the average cost of each trade target in euros.
    this.averages = {};
  }

  /**
   * Make preparations for import.
   */
  init() {
    this.amounts = {};
    this.averages = {};
    // Make sanity check.
    return this.knex.max('id AS max').from('period')
      .then((data) => {
        if (!data || !data.length) {
          throw new Error('Cannot find any periods from the database.');
        }
        return (this.knex.select('description')
          .from('entry')
          .where('description', 'LIKE', '%[' + this.config.service  + ']%k.h.%')
          .leftJoin('document', 'entry.document_id', 'document.id').orderBy('date', 'desc'));
      })
      .then((data) => {
        data.forEach((desc) => {
          const regex = /\bk\.h\. (nyt )?([0-9,]+\.\d\d) €\/([A-Z]+)\b/.exec(desc.description);
          if (regex) {
            const price = parseFloat(regex[2].replace(/,/g, ''));
            const target = regex[3];
            if (!this.averages[target]) {
              this.averages[target] = price;
              console.log('Using average', num.currency(price, '€/' + target));
            }
          }
        });
      });
  }

  /**
   * Resolve account number based on its purpose.
   * @param {string} name Account purpose (see `configure()`).
   */
  getAccount(name) {
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
   * Recognize the type of the transaction.
   *
   * @param {Object} txo An transaction object.
   * @return {string} One of the 'deposit', 'withdrawal', 'sell' or 'buy'.
   */
  recognize(txo) {
    throw new Error('Importer does not implement recognize().');
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
        {number: this.getAccount('euro'), amount: Math.round((txo.total - txo.fee) * 100) / 100},
        {number: this.getAccount('fees'), amount: txo.fee},
        {number: this.getAccount('bank'), amount: -txo.total},
      ];
    }
    return [
      {number: this.getAccount('euro'), amount: txo.total},
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
        {number: this.getAccount('euro'), amount: -txo.total},
      ];
    }
    return [
      {number: this.getAccount('bank'), amount: txo.total},
      {number: this.getAccount('euro'), amount: -txo.total},
    ];
  }

  /**
   * Create buying entries.
   */
  buyEntries(txo) {
    let ret = [
      {number: this.getAccount(txo.target.toLowerCase()), amount: Math.round((txo.total - txo.fee) * 100) / 100},
      {number: this.getAccount('fees'), amount: txo.fee},
      {number: this.getAccount('euro'), amount: -txo.total},
    ];

    return ret;
  }

  /**
   * Create selling entries.
   */
  sellEntries(txo) {
    let ret = [
      {number: this.getAccount('euro'), amount: Math.round((txo.total - txo.fee) * 100) / 100},
      {number: this.getAccount('fees'), amount: txo.fee},
    ];

    const avgPrice = this.averages[txo.target] || 0;
    const buyPrice = Math.round(100 * (-txo.tradeAmount) * avgPrice) / 100;

    if (this.config.noProfit) {
      // In case of not calculating profits yet, put in only buy price.
      ret.push({number: this.getAccount(txo.target.toLowerCase()), amount: -txo.total});
    } else {
      // Otherwise calculate losses or profits from the average price.
      const diff = Math.round((buyPrice - txo.total) * 100) / 100;
      if (diff > 0) {
        // In losses, add to debit side into losses.
        ret.push({number: this.getAccount('losses'), amount: diff});
        ret.push({number: this.getAccount(txo.target.toLowerCase()), amount: -buyPrice});
      } else if (diff < 0) {
        // In profits, add to credit side into profits
        ret.push({number: this.getAccount('profits'), amount: diff});
        ret.push({number: this.getAccount(txo.target.toLowerCase()), amount: -buyPrice});
      }
    }
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
        return 'Osto ' + num.trim(txo.tradeAmount, txo.target) + ' (' + parenthesis.join(', ')  + ')';
      case 'sell':
        parenthesis = [];
        if (!this.config.noProfit) {
          parenthesis.push('k.h. ' + num.currency(txo.targetAverage, '€/'  + txo.target));
        }
        parenthesis.push('jälj. ' + num.trim(txo.targetTotal, txo.target));
        return 'Myynti ' + num.trim(txo.tradeAmount, txo.target) + ' (' + parenthesis.join(', ') + ')';
      default:
        throw new Error('Cannot describe transaction of type ' + txo.type);
    }
  }

  /**
   * Calculate transaction total.
   *
   * @param {Object} txo An transaction object.
   * @return {Number}
   */
  total(txo) {
    throw new Error('Importer does not implement total().');
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
   * Pre-processing hook.
   * @param {<Array<Object>} list A list of objects read from the file.
   */
  preprocess(list) {
    return list;
  }

  /**
   * Post-processing hook.
   * @param {Array} lits All transaction objects.
   */
  postprocess(list) {
    return list;
  }

  /**
   * Process a group of original entries to the transaction data.
   *
   * @param {Array<any>} group
   * @return {Array<Object>}
   *
   * The processed entries are objects that contain properties:
   *   * `src` - original entry data
   *   * `type` - A classification of the transaction like ('withdrawal', 'deposit', 'sell', 'buy').
   *   * `total` - Total amount of the transaction, i.e. abs of debit/credit.
   *   * `target` - Name of the target in the trade (like 'ETH' or 'BTC').
   *   * `tradeAmount` - Amount of the target to trade as stringified decimal number.
   *   * `targetAverage` - Average price of the target after the transaction.
   *   * `targetTotal` - Number of targets owned after the transaction.
   *   * `fee` - Service fee in euros.
   *   * `tx.date`- a transaction date
   *   * `tx.description` - a transaction description
   *   * `tx.entries` - a list of transaction entries
   */
  process(group) {

    let ret = {
      src: group,
      type: null,
      total: null,
      target: null,
      tradeAmount: null,
      targetAverage: null,
      targetTotal: null,
      fee: null,
      tx: {
        date: null,
        description: null,
        entries: []
      }
    };

    // Get basics.
    ret.tx.date = this.date(group[0]);
    ret.type = this.recognize(ret);
    ret.total = this.total(ret);
    ret.fee = this.fee(ret);
    if (ret.type !== 'withdrawal' && ret.type !== 'deposit') {
      ret.target = this.target(ret);
    }

    // Initialize new targgets.
    if (ret.target !== null && this.amounts[ret.target] === undefined) {
      this.amounts[ret.target] = 0.0;
    }
    if (ret.target !== null && this.averages[ret.target] === undefined) {
      this.averages[ret.target] = 0.0;
    }

    // Calculate amounts and entries.
    if (ret.type !== 'withdrawal' && ret.type !== 'deposit') {
      ret.tradeAmount = this.amount(ret);
    }
    ret.tx.entries = this.entries(ret);

    // Update cumulative amounts.
    if (ret.tradeAmount !== null) {
      const oldTotal = this.amounts[ret.target];
      const oldAverage = this.averages[ret.target];
      const oldPrice = oldTotal * oldAverage;
      const newPrice = ret.total - ret.fee;
      this.amounts[ret.target] += ret.tradeAmount;
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
   * @return {Promise<Array<Object>>}
   *
   * The first row is assumed to have headers and they are used to construct
   * an array of objects containing each row as members defined by the first header row.
   */
  loadCSV(file) {
    return new Promise((resolve, reject) => {

      let headers = null;

      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        data = data.toString();
        let lines = [];

        csv({noheader:true})
          .fromString(data)
          .on('csv',(row) => {
            if (headers === null) {
              headers = row;
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
      .then((groups) => groups.map((group => this.process(group))))
      .then((txobjects) => this.fixRoudingErrors(txobjects))
      .then((txobjects) => this.postprocess(txobjects))
      .then((txobjects) => {
        if (dryRun) {
          txobjects.forEach((txo) => {
            console.log('\u001b[33;1m', txo.tx.date, txo.tx.description, '\u001b[0m');
            console.log('           ', txo.type, txo.tradeAmount, txo.target, 'owned', txo.targetTotal, 'avg.', txo.targetAverage);
            txo.tx.entries.forEach((entry) => {
              console.log('           \u001b[33m', entry.number, '\u001b[0m', entry.amount);
            });
          });
        }
        return txobjects;
      })
      .then((txobjects) => {
        if (!dryRun) {
          // TODO: We could do sanity checks here and refuse if entries are there already. (Or in tx.add()?)
          const creators = txobjects.map((txo) => () => tx.add(db, txo.tx.date, txo.tx.description, txo.tx.entries));
          console.log('Saving', creators.length, 'entries.');
          return promiseSeq(creators)
            .then(() => txobjects.length);
        } else {
          return txobjects.length;
        }
      });
  }
}

module.exports = Import;
