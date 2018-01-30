const fs = require('fs');
const knex = require('../knex');
const csv = require('csvtojson');
const num = require('../num');

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
    // TODO: Find the latest period.
    // TODO: Find the initial average prices bought for each this service provider for each crypto.
    this.amounts = {};
    this.averages = {};
    return Promise.resolve();
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
   * Get the date of the transaction.
   * @param {Object} txo An transaction object.
   * @return {string} the date in YYYY-MM-DD format.
   */
  date(txo) {
    throw new Error('Importer does not implement date().');
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
   * @return {string}
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
    return [
      {number: this.getAccount('euro'), amount: txo.total},
      {number: this.getAccount('bank'), amount: -txo.total},
    ];
  }

  /**
   * Create withdrawal entries.
   */
  withdrawalEntries(txo) {
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
      {number: this.getAccount(txo.target.toLowerCase()), amount: Math.round((txo.total - txo.fee)*100) / 100},
      {number: this.getAccount('fees'), amount: txo.fee},
      {number: this.getAccount('euro'), amount: -txo.total},
    ];

console.log(txo.tx.date, txo.type, txo.tradeAmount, txo.target, 'avg.', this.averages[txo.target], 'has:', this.amounts[txo.target]);
console.log(this.describe(txo));
console.log(ret);
    return ret;
  }

  /**
   * Create selling entries.
   */
  sellEntries(txo) {
    const avgPrice = this.averages[txo.target] || 0;
    const buyPrice = Math.round(100 * (-txo.tradeAmount) * avgPrice) / 100;
    let ret = [
      {number: this.getAccount('euro'), amount: txo.total},
      {number: this.getAccount('fees'), amount: txo.fee},
      {number: this.getAccount(txo.target.toLowerCase()), amount: -buyPrice},
    ];
    let diff = Math.round((buyPrice - txo.total) * 100) / 100;
    if (diff) {
      ret.push({
        number: (buyPrice > txo.total ? this.getAccount('losses') : this.getAccount('profits')),
        amount: diff
      });
    }

console.log(txo.tx.date, txo.type, txo.tradeAmount, txo.target, 'avg.', this.averages[txo.target], 'has:', this.amounts[txo.target]);
console.log(this.describe(txo));
console.log(ret);

    return ret;
  }

  /**
   * Construct the description for the transaction.
   *
   * @param {Object} txo An transaction object.
   * @return {string}
   */
  describe(txo) {
    switch(txo.type) {
      case 'deposit':
        return 'Talletus ' + this.serviceName + '-palveluun';
      case 'withdrawal':
        return 'Nosto ' + this.serviceName + '-palvelusta';
      case 'buy':
        return 'Osto ' + num.trim(txo.tradeAmount, txo.target);
      case 'sell':
        return 'Myynti ' + num.trim(txo.tradeAmount, txo.target);
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
   * @param {<Array<any>} group A group of original data forming a transaction.
   */
  preprocess(group) {
    return group;
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
   *   * `tradeTotalAmount` - Total amount of the trade target owned after this transaction.
   *   * `tradeTotalCost` - Total cost of the trade target owned after this transaction.
   *   * `fee` - Service fee in euros.
   *   * `tx.date`- a transaction date
   *   * `tx.description` - a transaction description
   *   * `tx.entries` - a list of transaction entries
   */
  process(group) {

    let ret = {
      src: group,
      tx: {
        date: null,
        description: null,
        entries: []
      }
    };

    // Get basics.
    ret.type = this.recognize(ret);
    ret.tx.date = this.date(ret);
    ret.total = this.total(ret);
    ret.target = this.target(ret);

    // Initialize new targgets.
    if (this.amounts[ret.target] === undefined) {
      this.amounts[ret.target] = 0.0;
    }
    if (this.averages[ret.target] === undefined) {
      this.averages[ret.target] = 0.0;
    }

    // Calculate amounts and entries.
    ret.tradeAmount = this.amount(ret);
    ret.fee = this.fee(ret);
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
    }

    ret.tx.description = (this.config.tags ? this.config.tags + ' ' : '') + this.describe(ret);

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
   * @return {Promise}
   */
  import(db, file) {
    this.knex = knex.db(db);
    return this.init()
      .then(() => this.load(file))
      .then((data) => this.grouping(data))
      .then((groups) => groups.map((group => this.preprocess(group))))
      .then((groups) => groups.map((group => this.process(group))))
      .then((txobjects) => this.fixRoudingErrors(txobjects))
      .then((txobjects) => this.postprocess(txobjects));
  }
}

module.exports = Import;
