const Import = require('../import');

class GDAXImport extends Import {

  constructor() {
    super('GDAX');
  }

  load(file) {
    return this.loadCSV(file);
  }
}

module.exports = new GDAXImport();
