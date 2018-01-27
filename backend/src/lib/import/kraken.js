const Import = require('./base');

class KrakenImport extends Import {

  load(file) {
    return this.loadCSV(file);
  }

  map(entry) {
    switch (entry.type) {
      default:
        throw new Error('No handler for Kraken transaction type `' + entry.type + '`.');
    }
  }
}

module.exports = new KrakenImport();
