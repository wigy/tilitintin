import { extendObservable, runInAction } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

/**
 * The store structure is the following:
 * {
 *   dbs: ['dbname1', 'dbname2'],
 *   title: "Current Title",
 *   tags: {
 *     TODO: Docs.
 *   },
 *   periods: [
 *     periodId: {
 *       id: 1,
 *       start_date: "2016-12-31T22:00:00.000Z",
 *       "end_date": "2017-12-30T22:00:00.000Z",
 *       "locked": 0,
 *     }, ...
 *   ],
 *   balances: [
 *       accountID: {
 *         id: 94,
 *         number: "1543",
 *         name: "Arvopaperit",
 *         debit: 3654285,
 *         credit: -19228,
 *         total: 3635057,
 *       }, ...
 *     ]
 *   },
 *   accounts: [
 *     accountID: {
 *       ...
 *       transactions: [
 *         ...,
 *         ...
 *       ]
 *     }, ...
 *   ],
 *   transactions: [
 *      TODO: Docs.
 *   ]
 * }
 */
class Store {

  constructor() {
    extendObservable(this, {
      dbs: [],
      periods: [],
      balances: [],
      accounts: [],
      title: '',
      transactions: [],
      tags: {},
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

  getTags(db) {
    return this.fetch('/db/' + db + '/tags')
      .then((tags) => {
        this.tags = {};
        tags.forEach((tag) => this.tags[tag.tag] = tag);
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
    return this.fetch('/db/' + db + '/period')
      .then((periods) => {
        runInAction(() => {
          this.periods = [];
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
          this.balances = [];
          balances.balances.forEach((balance) => {
            this.balances.push(balance);
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
    this.getTags(db);
    return this.fetch('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        runInAction(() => {
          this.transactions = account.transactions;
          this.title = account.number + ' ' + account.name;
          this.transactions.forEach((tx, i) => {
            const regex = /^((\[[a-zA-Z0-9]+\])*)\s*(.*)/.exec(tx.description);
            if (regex) {
              tx.description = regex[3];
              tx.tags = regex[1].substr(1, regex[1].length - 2).split('][');
            }
          });
        });
        return account;
      });
  }
}

export default Store;
