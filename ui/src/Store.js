import { extendObservable } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

class Store {

  constructor() {
    extendObservable(this, {
      accounts: {},
      periods: []
    });
    this.getPeriods();
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
      .then(periods => this.periods = periods);
  }
}

export default Store;
