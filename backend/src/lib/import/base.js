const fs = require('fs');
const knex = require('../knex');
const csv = require('csvtojson');

/**
 * A base class for importing data files and converting them to the transactions.
 *
 * Process is the following, when calling `import(db, path)`:
 *
 * 1. File is loaded first with `load(path)`.
 * 2. An array of data is received and converted to
 */
class Import {

  /**
   * Read in the data from the file and store it internally.
   * @param {string} file A path to the file.
   * @return {Promise<any>} Promise resolving to the parsed data.
   */
  load(file) {
    throw new Error('Importer does not implement load().');
  }

  /**
   * Convert an entry to a transaction.
   * @param {any} entry Input data.
   * @return {any} transaction data.
   */
  map(entry) {
    throw new Error('Importer does not implement map().');
  }

  /**
   * Handler function for data, that has been loaded from the file converting it to the list of TXs.
   *
   * @param {Array<any>} data
   * @return {Array<Object>}
   *
   * The processed entries are objects that contain transactions as field `tx`, original entry as `src`
   * and possibly some additional data like running internal balance counters.
   */
  process(data) {
    let ret = [];
    data.forEach((entry) => {
      ret.push({
        src: entry,
        rx: this.map(entry)
      });
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
      .then((data) => this.process(data));
  }
}

module.exports = Import;
