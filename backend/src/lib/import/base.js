const fs = require('fs');
const knex = require('../knex');
const csv = require('csvtojson');

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
 *    d) Construct entries for transaction with `entries(txobject)`.
 *       - Based on the type, the function `<type>Entries(txobject)` is called.
 *    e) The description is constructed with `describe(txobject)`.
 * 6. Each transaction object is post-processed in `postprocess(txobject)`.
 */
class Import {

  constructor(serviceName) {
    this.config = {};
    this.serviceName = serviceName;
  }

  /**
   * Make preparations for import.
   */
  init() {
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
        // TODO: Currency? Amount?
        return '? osto +-?';
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
   * Pre-processing hook.
   * @param {<Array<any>} group A group of original data forming a transaction.
   */
  preprocess(group) {
    return group;
  }

  /**
   * Post-processing hook.
   * @param {Object} txo A transaction object.
   */
  postprocess(txo) {
    return txo;
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
    ret.type = this.recognize(ret);
    ret.tx.date = this.date(ret);
    ret.total = this.total(ret);
    ret.tx.entries = this.entries(ret);
    ret.tx.description = (this.config.tags ? this.config.tags + ' ' : '') + this.describe(ret);

    console.log('');
    console.log(group);
    console.log('');
    console.log('=>', ret.tx);
    console.log('');

    return ret;
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
      .then((txobjects) => txobjects.map((txobject => this.postprocess(txobject))));
  }
}

module.exports = Import;
