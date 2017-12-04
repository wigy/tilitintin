import { extendObservable } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

class Store {

  constructor() {
    extendObservable(this, {
      dbs: []
    });
    this.getDatabases();
  }

  fetch(path) {
    return fetch(URL + path)
    .then(res => {
      return res.json();
    })
    .catch(err => {
      console.error(err);
    });
  }

  getDatabases() {
    return this.fetch('/db')
      .then(dbs => {
        dbs = dbs.map(db => db.name);
        this.dbs = dbs;
        return dbs;
      });
  }

  getPeriods(db) {
    return this.fetch('/db/' + db + '/period');
  }

  getPeriod(db, id) {
    return this.fetch('/db/' + db + '/period/' + id);
  }

  getAccounts(db) {
    this.accounts = [];
    return this.fetch('/db/' + db + '/account');
  }

  getAccountPeriod(db, id, periodId) {
    return this.fetch('/db/' + db + '/account/' + id + '/' + periodId);
  }
}

export default Store;
