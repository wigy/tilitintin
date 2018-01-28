const fs = require('fs');
const knex = require('../knex');
const csv = require('csvtojson');

/**
 * A base class for importing data files and converting them to the transactions.
 *
 * Process is the following, when calling `import(db, path)`:
 *
 * 1. File is loaded first with `load(path)`.
 * 2. An array of data is received and are then grouped to entries forming transactions with `grouping(data)`.
 */
class Import {

  constructor() {
    this.config = {};
  }

  /**
   * Set the configuration for the importer.
   *
   * @param {Object} config
   *
   * Configuration variables are:
   *   * `bankAccount` - account number for bank deposits and withdraws
   *   * `euroAccount` - account number for storing € in the service
   *   * `cryptoAccount` - account number for storing crypto currencies by default
   *   * `ethAccount` - account number for storing ETH
   *   * `btcAccount` - account number for  storing BTC
   *   * `roundingAccount` - account number for trimming transaction rounding errors
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
   * @param {any} entry Input data.
   * @return {string} the date in YYYY-MM-DD format.
   */
  date(entry) {
    throw new Error('Importer does not implement date().');
  }

  /**
   * Reorganize entries so that they are grouped to the arrays forming one single transaction.
   *
   * @param {Array<any>} entries
   * @return {Array<Array<any>>}
   */
  grouping(entries) {
    let ret = {};
    entries.forEach((entry) => {
      ret[entry.refid] = ret[entry.refid] || [];
      ret[entry.refid].push(entry);
    });

    return Object.values(ret);
  }

  /**
   * Handler function for data, that has been loaded from the file converting it to the list of TXs.
   *
   * @param {Array<any>} data
   * @return {Array<Object>}
   *
   * The processed entries are objects that contain properties:
   *   * `tx.date`- a transaction date
   *   * `tx.description` - a transaction description
   *   * `tx.entries` - a list of transaction entries
   *   * `src` - original entry data
   *   * possibly some additional data like running internal balance counters
   */
  process(data) {
    let ret = [];
    data.forEach((entry) => {
      let item = {
        src: entry,
        tx: {
          date: this.date(entry)
        }
      };
      ret.push(item);
    });
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
    return this.load(file)
      .then((data) => this.grouping(data));
  }
}

module.exports = Import;
