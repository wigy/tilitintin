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
 *      {
 *        id: 1,
 *        account_id:
 *        document_id":158,
 *        account_id":886,
 *        debit":1,
 *        amount:120000,
 *        description: "Text description",
 *        row_number": 1,
 *        flags":0,
 *        number:5,
 *        period_id": 1,
 *        date: "2017-07-31T21:00:00.000Z",
 *        entries: [
 *          { all entries linked to the same document_id in the same format as above transaction }
 *        ],
 *        open: false, // If UI has opened entries.
 *        tags: [], // Tags extracted from description.
 *      }
 *   ],
 *   tools: {
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   }
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
      tools: {
        tagDisabled: {
        }
      }
    });
    this.getDatabases();
  }

  fetch(path, method='GET', data=null) {
    let options = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    if (this.token) {
      options.headers.Authorization = 'Bearer ' + this.token;
    }
    if (data !== null) {
      options.body =  JSON.stringify(data);
    }
    return fetch(URL + path, options)
    .then(res => {
      return res.json();
    })
    .catch(err => {
      console.error(err);
    });
  }

  /**
   * Set the current database.
   * @param {String} db
   * @return {Boolean} True if no changes needed.
   */
  setDb(db) {
    if (db && this.db === db) {
      return true;
    }
    this.db = db;
    this.periods = [];
    this.setPeriod(null);
    if (db) {
      this.getPeriods()
        .then(() => {
          this.getTags();
        });
    }
    return false;
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Boolean} True if no changes needed.
   */
  setPeriod(db, periodId) {
    if (periodId && this.setDb(db) && this.periodId === periodId) {
      return true;
    }
    this.periodId = periodId;
    this.balances = [];
    this.accounts = [];
    this.setAccount(null);
    if (periodId) {
      this.getBalances();
    }
    return false;
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Boolean} True if no changes needed.
   */
  setAccount(db, periodId, accountId) {
    if (accountId && this.setPeriod(db, periodId) && this.accountId === accountId) {
      return true;
    }
    this.title = '';
    this.transactions = [];
    this.tags = {};
    this.account = {};
    this.tools = {
      tagDisabled: {
      }
    };
    if (accountId) {
      this.getAccountPeriod(db, periodId, accountId);
    }
    return false;
  }

  /**
   * Get the tag definitions from the current database.
   */
  getTags() {
    return this.fetch('/db/' + this.db + '/tags')
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
   * Get the list of periods available for the current DB.
   */
  getPeriods() {
    return this.fetch('/db/' + this.db + '/period')
      .then((periods) => {
        runInAction(() => {
          this.periods = [];
          periods.forEach((period) => {
            this.periods.push(period);
          });
          return this.periods;
        });
      });
  }

  /**
   * Get the summary of balances for all accounts in the current period.
   */
  getBalances() {
    return this.fetch('/db/' + this.db + '/period/' + this.periodId)
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
   * @param {*} periodId
   * @param {*} accountId
   */
  getAccountPeriod(db, periodId, accountId) {
    return this.fetch('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        runInAction(() => {
          this.account = account;
          this.transactions = account.transactions;
          this.title = account.number + ' ' + account.name;
          let tags = {};
          this.transactions.forEach((tx) => {
            const regex = /^((\[[a-zA-Z0-9]+\])*)\s*(.*)/.exec(tx.description);
            if (regex[1]) {
              tx.description = regex[3];
              tx.tags = regex[1].substr(1, regex[1].length - 2).split('][');
              tx.tags.forEach((tag) => tags[tag] = true);
            } else {
              tx.tags = [];
            }
            tx.open = false;
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
    this.token = null;
    return this.fetch(URL + '/auth', 'POST', {user: user, password: password})
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
