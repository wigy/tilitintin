const Import = require('../import');

class GDAXImport extends Import {

  constructor() {
    super('GDAX');
  }

  load(files) {
    return Promise.all(files.map((file) => this.loadCSV(file)))
      .then((data) => data.reduce((prev, cur) => prev.concat(cur), []));
  }
}

module.exports = new GDAXImport();
