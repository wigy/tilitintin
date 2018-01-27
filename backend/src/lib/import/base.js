const fs = require('fs');
const knex = require('../knex');
const csv=require('csvtojson');

class Import {

  /**
   * Read in the data from the file and store it internally.
   * @param {string} file A path to the file.
   */
  load(file) {
    throw new Error('Importer does not implement load().');
  }

  /**
   * A loader for CSV file.
   *
   * @param {string} file A path to the file.
   * @return {Promise}
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
        this.data = [];

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
              this.data.push(line);
            }
          })
          .on('done',()=>{
            resolve(this.data);
          });
      });
    });
  }

  /**
   * Handler for importing.
   *
   * @param {string} db Name of the database.
   * @param {string} file A path to the file to be imported.
   */
  import(db, file) {
    this.knex = knex.db(db);
    this.load(file);
  }
}

module.exports = Import;
