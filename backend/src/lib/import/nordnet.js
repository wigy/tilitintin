const Import = require('./base');

class NordnetImport extends Import {

  constructor() {
    super('Nordnet');
  }

  load(file) {
    return this.loadCSV(file, {delimiter: ';'});
  }

  date(entry) {
    return entry.Kirjausp_iv_;
  }

  time(entry) {
    return parseInt(entry.Id);
  }

  grouping(entries) {
    entries = entries.filter((entry) => Object.keys(entry).length);
    return Promise.resolve(entries.map((entry) => [entry]));
  }
}

module.exports = new NordnetImport();
