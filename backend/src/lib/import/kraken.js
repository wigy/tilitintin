const Import = require('./base');

class KrakenImport extends Import {

  load(file) {
    return this.loadCSV(file);
  }

  date(entry) {
    return entry.time.substr(0, 10);
  }

  map(txdata, entry) {
    switch (entry.type) {
      default:
        throw new Error('No handler for Kraken transaction type `' + entry.type + '`.');
    }
  }
}

module.exports = new KrakenImport();
