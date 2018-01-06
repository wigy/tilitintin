import { extendObservable } from 'mobx';

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
      periods: {},
      balances: {},
      accounts: {},
    });
    this.getAll();
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

  getAll() {
    // TODO: Slow down this process to avoid doing excessive fetches parallel.
    let dbs;
    this.getDatabases()
      .then((_dbs) => {
        dbs = _dbs;
        return Promise.all(dbs.map((db) => this.getPeriods(db)));
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
    return this.fetch('/db/' + db + '/period')
      .then((periods) => {
        this.periods[db] = this.periods[db] || {};
        periods.forEach((period) => {
          this.periods[db][period.id] = period;
        });
        return periods;
      })
      .then((periods) => {
        return Promise.all(periods.map((period) => this.getBalances(db, period.id)));
      });
  }

  getBalances(db, periodId) {
    return this.fetch('/db/' + db + '/period/' + periodId)
      .then((balances) => {
        this.balances[db] = this.balances[db] || {};
        this.balances[db][periodId] = this.balances[db][periodId] || {};
        let promises = [];
        balances.balances.forEach((balance) => {
          this.balances[db][periodId][balance.id] = balance;
          promises.push(this.getAccountPeriod(db, balance.id, periodId));
        });
        return Promise.all(promises);
      });
  }

  getAccounts(db) {
    this.accounts = [];
    return this.fetch('/db/' + db + '/account');
  }

  getAccountPeriod(db, accountId, periodId) {
    return this.fetch('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        this.accounts[db] = this.accounts[db] || {};
        this.accounts[db][periodId] = this.accounts[db][periodId] || {};
        this.accounts[db][periodId][account.id] = account;
        return account;
      });
  }
}

export default Store;