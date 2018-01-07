import { extendObservable, runInAction, observable } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

/**
 * The store structure is the following:
 * {
 *   dbs: ['dbname1', 'dbname2'],
 *   periods: {
 *     dbname1: {
 *       periodId: {
 *         id: 1,
 *         start_date: "2016-12-31T22:00:00.000Z",
 *         "end_date": "2017-12-30T22:00:00.000Z",
 *         "locked": 0,
 *       }, ...
 *     }
 *   },
 *   balances: {
 *     dbname1: {
 *       periodID: {
 *         accountID: {
 *           id: 94,
 *           number: "1543",
 *           name: "Arvopaperit",
 *           debit: 3654285,
 *           credit: -19228,
 *           total: 3635057,
 *         }, ...
 *       }
 *     }
 *   },
 *   accounts: {
 *     dbname1: {
 *       periodID: {
 *         accountID: {
 *           ...
 *           transactions: [
 *             ...,
 *             ...
 *           ]
 *         }, ...
 *       }
 *     }
 *   },
 * }
 */
class Store {

  constructor() {
    extendObservable(this, {
      dbs: [],
      periods: [],
      balances: {},
      accounts: {},
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
        runInAction(() => {
          dbs = dbs.map(db => db.name);
          this.dbs = dbs;
        });
        return dbs;
      });
  }

  getPeriods(db) {
    this.periods = [];
    return this.fetch('/db/' + db + '/period')
      .then((periods) => {
        runInAction(() => {
          periods.forEach((period) => {
            this.periods.push(period);
          });
        });
        return periods;
      });
  }

  getBalances(db, periodId) {
    return this.fetch('/db/' + db + '/period/' + periodId)
      .then((balances) => {
        runInAction(() => {
          this.balances[db] = this.balances[db] || {};
          this.balances[db][periodId] = this.balances[db][periodId] || {};
          balances.balances.forEach((balance) => {
            this.balances[db][periodId][balance.id] = balance;
          });
        });
        return balances;
      });
  }

  getAccounts(db) {
    this.accounts = [];
    return this.fetch('/db/' + db + '/account');
  }

  getAccountPeriod(db, accountId, periodId) {
    return this.fetch('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        runInAction(() => {
          this.accounts[db] = this.accounts[db] || {};
          this.accounts[db][periodId] = this.accounts[db][periodId] || {};
          this.accounts[db][periodId][account.id] = account;
        });
        return account;
      });
  }
}

export default Store;
