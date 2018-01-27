const Import = require('./base');

class KrakenImport extends Import {

  load(file) {
    this.loadCSV(file);
  }

}

module.exports = new KrakenImport();
