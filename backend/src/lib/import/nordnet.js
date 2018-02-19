const Import = require('./base');

class NordnetImport extends Import {

  constructor() {
    super('Nordnet');
  }

  load(file) {
    // TODO: Need own headers here.
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

  recognize(txo) {
    const type = txo.src[0].Tapahtumatyyppi.replace(/\W/g, '_');
    switch (type) {
      case 'OSINKO':
        return 'divident';
      default:
        throw new Error('Cannot recognize entry of type ' + type + ': ' + JSON.stringify(txo));
    }
  }

  total(txo) {
    console.log(txo);
  }
}

module.exports = new NordnetImport();
