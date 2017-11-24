import { extendObservable } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

class Store {

  constructor() {
    extendObservable(this, {
      dbs: [],
      accounts: [],
      accountsById: {},
      periods: []
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
    // TODO: Do we need to store anything really? Cache perhaps?
    return this.fetch('/db/' + db + '/period')
      .then(periods => {
        this.periods = periods;
        return periods;
      });
  }

  getPeriod(db, id) {
    return this.fetch('/db/' + db + '/period/' + id);
  }

  getAccounts(db) {
    this.accounts = [];
    return this.fetch('/db/' + db + '/account')
      .then(accounts => {
        this.accounts = accounts;
        accounts.forEach(acc => this.accountsById[acc.id] = acc);
        return accounts;
      });
  }

  getAccountPeriod(db, id, periodId) {
    return this.fetch('/db/' + db + '/account/' + id + '/' + periodId)
      .then(account => {
        return account;
      });
  }
}

export default Store;
