import { extendObservable, runInAction } from 'mobx';

const URL = document.location.protocol + '//' + document.location.hostname + ':3001';

/**
 * The store structure is the following:
 * {
 *   token: null
 *   dbs: ['dbname1', 'dbname2'],
 *   db: 'currentdb',
 *   periodId: 1,
 *   title: "Current Title",
 *   tags: {
 *     TagCode:
 *       id: 1,
 *       tag: "TagCode",
 *       name: "Tag description",
 *       picture: "https://site.to.store/picture",
 *       type: "Category",
 *       order: 102,
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
 *   account: {
 *     id: 12,
 *     number: 1234,
 *     name: "Account Name",
 *     type: "ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT",
 *     tags: ["Tag1", "Tag2"],
 *   },
 *   transactions: [
 *      TODO: Docs.
 *   ]
 * }
 */
class Store {

  constructor() {
    extendObservable(this, {
      token: localStorage.getItem('token'),
      dbs: [],
      db: null,
      periodId: null,
      periods: [],
      balances: [],
      accounts: [],
      title: '',
      transactions: [],
      tags: {},
      account: {},
    });
    this.getDatabases();
  }

  fetch(path) {
    // TODO: Support for POST.
    if (!this.token) {
      return Promise.reject('Not authenticated.');
    }
    return fetch(URL + path, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
    })
    .then(res => {
      return res.json();
    })
    .catch(err => {
      console.error(err);
    });
  }

  /**
   * Get the tag definitions from the current database.
   * @param {*} db
   */
  getTags(db) {
    if (this.db === db) {
      return Promise.resolve(this.tags);
    }
    return this.fetch('/db/' + db + '/tags')
      .then((tags) => {
        this.tags = {};
        tags.forEach((tag) => this.tags[tag.tag] = tag);
        return this.tags;
      });
  }

  /**
   * Get the list of available databases.
   */
  getDatabases() {
    if (this.dbs.length) {
      return Promise.resolve(this.dbs);
    }
    return this.fetch('/db')
      .then(dbs => {
        runInAction(() => {
          dbs = dbs.map(db => db.name);
          this.dbs = dbs;
        });
        return dbs;
      });
  }

  /**
   * Get the list of periods available for the given DB.
   * @param {*} db
   */
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

  /**
   * Get the summary of balances for all accounts in the given period.
   * @param {*} db
   * @param {*} periodId
   */
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

  /**
   * Fetch the account data for the given period and store it to this store as current account.
   * @param {*} db
   * @param {*} accountId
   * @param {*} periodId
   */
  getAccountPeriod(db, accountId, periodId) {
    this.getTags(db);
    if (this.db === db && this.account.id === accountId && this.periodId === periodId) {
      return Promise.resolve(this.account);
    }
    return this.fetch('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        runInAction(() => {
          this.db = db;
          this.periodId = periodId;
          this.account = account;
          this.transactions = account.transactions;
          this.title = account.number + ' ' + account.name;
          let tags = {};
          this.transactions.forEach((tx, i) => {
            const regex = /^((\[[a-zA-Z0-9]+\])*)\s*(.*)/.exec(tx.description);
            if (regex[1]) {
              tx.description = regex[3];
              tx.tags = regex[1].substr(1, regex[1].length - 2).split('][');
              tx.tags.forEach((tag) => tags[tag] = true);
            } else {
              tx.tags = [];
            }
          });
          this.account.tags = Object.keys(tags);
        });
        return account;
      });
  }

  /**
   * Sort the given list (or current account's) of tags to their official order.
   * @param {Array<Object>|null} tags
   */
  sortTags(tags=null) {
    if (tags === null) {
      tags = this.account.tags || [];
    }
    let ret = tags.map((tag) => this.tags[tag] || {tag: tag, order: 9999999});
    return ret.sort((a, b) => a.order - b.order);
  }

  /**
   * Login to the back-end.
   * @param {String} user
   * @param {String} password
   */
  login(user, password) {
    // TODO: Use common fetch functionality.
    this.token = null;
    return fetch(URL + '/auth', {
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({user: user, password: password})
    })
    .then((resp) => {
      if (resp.status === 200) {
        resp.json().then((data) => {
          runInAction(() => {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            this.getDatabases();
          });
        });
      }
    });
  }

  /**
   * Log out the current user.
   */
  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export default Store;
