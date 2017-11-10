import { extendObservable } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

class Store {

  constructor() {
    extendObservable(this, {
      accounts: [],
      accountsById: {},
      periods: []
    });
    this.getPeriods();
    this.getAccounts();
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

  getPeriods() {
    return this.fetch('/period')
      .then(periods => {
        this.periods = periods;
        return periods;
      });
  }

  getAccounts() {
    return this.fetch('/account')
      .then(accounts => {
        this.accounts = accounts;
        accounts.forEach(acc => this.accountsById[acc.id] = acc);
        return accounts;
      });
  }

  getPeriod(id) {
    return this.fetch('/period/' + id);
  }
}

export default Store;
