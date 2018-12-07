import { runInAction, computed, toJS, observable } from 'mobx';
import config from './Configuration';
import Navigator from './Navigator';

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
 *       {
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
 *     {
 *       name: "Muiden vapaaehtoisten varausten muutos"
 *       number: "9890"
 *       type: "EXPENSE"
 *       vat_account1_id: null
 *       vat_account2_id: null
 *       vat_code: 0
 *       vat_percentage: 0
 *     }, ...
 *   ],
 *   accountsById: {
 *     1011: {
 *       // References to the accounts array.
 *     }
 *   },
 *   headings: {
 *     "1001": [{
 *       "text": "Vastaavaa",
 *       "level": 0
 *     },...]
 *   },
 *   account: { // Currently selected account.
 *     id: 12,
 *     number: 1234,
 *     name: "Account Name",
 *     type: "ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT",
 *     tags: ["Tag1", "Tag2"],
 *   },
 *   transactions: [ // This is a selected collection of primary entries, usually for single account on single period.
 *      {
 *        id: 158,             // Same as document_id.
 *        account_id: 123,
 *        document_id:158,
 *        account_id:886,
 *        entry_id:123,        // ID of the entry this main entry describes.
 *        debit:1,
 *        amount:120000,
 *        description: "Text description",
 *        row_number: 1,
 *        flags: 0,
 *        number: 5,           // Account number.
 *        name: 'My Account',  // Account name.
 *        period_id: 1,
 *        date: "2017-07-31T21:00:00.000Z",
 *        entries: [
 *          {
 *            All entries that are linked to the same document_id are in the same format as above transaction.
 *            One of the entries is the transaction itself. Entries has their `id` instead of `entry_id`.
 *          }
 *        ],
 *        open: false, // If UI has opened entries.
 *        tags: [], // Tags extracted from description as strings.
 *      }
 *   ],
 *   tools: {
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   }
 *   // Keyboard navigation
 *   selected: {
 *     page: 'Balances',
 *     component: 'BalanceTable',
 *     index: 2,
 *     column: null,
 *     row: null,
 *     editor: 'abc'
 *   },
 *   oldSelected: {
 *     Reports: { ... }
 *   }
 * }
 */
class Store {

  @observable transactions = [];
  @observable changed = false;
  @observable token = localStorage.getItem('token');
  @observable dbs = [];
  @observable db = null;
  @observable periodId = null;
  @observable accountId = null;
  @observable periods = [];
  @observable balances = [];
  @observable headings = {};
  @observable accounts = [];
  @observable accountsById = {};
  @observable title = '';
  @observable tags = {};
  @observable account = {};
  @observable tools = { tagDisabled: {} };
  @observable selected = {
    page: 'App',
    component: null,
    index: null,
    column: null,
    row: null,
    editor: false
  };

  constructor() {
    this.navigator = new Navigator(this);
    this.oldSelected = {};
    this.getDatabases();
  }

  /**
   * Reset selections.
   */
  resetSelected() {
    this.selected.index = null;
    this.selected.column = null;
    this.selected.row = null;
    this.selected.editor = false;
  }

  /**
   * Make a HTTP request to the back-end.
   * @param {String} path
   * @param {String} method
   * @param {Object} data
   */
  request(path, method='GET', data=null) {
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
    return fetch(config.API_URL + path, options)
      .then(res => {
        this.changed = true;
        if ([200, 201, 202, 204].includes(res.status)) {
          return res.status === 200 ? res.json() : null;
        } else {
          throw new Error(res.status + ' ' + res.statusText);
        }
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
    this.resetSelected();
    this.changed = true;
    this.db = db;
    this.periods = [];
    this.accounts = [];
    this.accountsById = {};
    this.headings = {};
    this.tags = {};
    this.setPeriod(null);
    if (db) {
      this.getPeriods()
        .then(() => this.getTags())
        .then(() => this.getHeadings())
        .then(() => this.getAccounts());
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
    this.resetSelected();
    this.changed = true;
    this.periodId = periodId;
    this.balances = [];
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
    this.changed = true;
    this.accountId = accountId;
    this.title = '';
    this.transactions = [];
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
    return this.request('/db/' + this.db + '/tags')
      .then((tags) => {
        runInAction(() => {
          this.tags = {};
          tags.forEach((tag) => this.tags[tag.tag] = tag);
        });
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
    return this.request('/db')
      .then(dbs => {
        runInAction(() => {
          this.dbs = [];
          if (dbs) {
            this.dbs = dbs.map(db => db.name);
          }
        });
      });
  }

  /**
   * Get the list of periods available for the current DB.
   */
  getPeriods() {
    return this.request('/db/' + this.db + '/period')
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
    return this.request('/db/' + this.db + '/period/' + this.periodId)
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

  /**
   * Collect all accounts.
   */
  getAccounts() {
    return this.request('/db/' + this.db + '/account')
      .then((accounts) => {
        runInAction(() => {
          this.accounts = [];
          this.accountsById = {};
          accounts.forEach((account) => {
            this.accounts.push(account);
            this.accountsById[account.id] = account;
          });
        });
      });
  }

  /**
   * Collect all account headings.
   */
  getHeadings(db) {
    return this.request('/db/' + this.db + '/heading')
      .then((headings) => {
        runInAction(() => {
          this.headings = {};
          headings.forEach((heading) => {
            this.headings[heading.number] = this.headings[heading.number] || [];
            this.headings[heading.number].push(heading);
          });
        });
      });
  }

  /**
   * Fetch the account data for the given period and store it to this store as current account.
   * @param {String} db
   * @param {Number} periodId
   * @param {Number} accountId
   */
  getAccountPeriod(db, periodId, accountId) {

    // Helper to convert description to stripped description and tag flags object.
    const desc2tags = (desc) => {
      let ret = [desc, []];
      const regex = /^((\[[a-zA-Z0-9]+\])*)\s*(.*)/.exec(desc);
      if (regex[1]) {
        ret[0] = regex[3];
        ret[1] = regex[1].substr(1, regex[1].length - 2).split('][');
      }
      return ret;
    };

    return this.request('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((account) => {
        runInAction(() => {
          this.account = account;
          this.transactions = account.transactions;
          this.title = account.number + ' ' + account.name;
          let tags = {};
          this.transactions.forEach((tx) => {
            const [txDesc, txTags] = desc2tags(tx.description);
            tx.description = txDesc;
            tx.tags = txTags;
            tx.tags.forEach((tag) => tags[tag] = true);
            tx.open = false;
            tx.entries.forEach((entry) => {
              const [entryDesc, entryTags] = desc2tags(entry.description);
              entry.description = entryDesc;
              entry.tags = entryTags;
            });
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
    return this.request('/auth', 'POST', {user: user, password: password})
    .then((resp) => {
      if (resp && resp.token) {
        runInAction(() => {
          this.token = resp.token;
          localStorage.setItem('token', resp.token);
          this.getDatabases();
        });
      }
    });
  }

  /**
   * Log out the current user.
   */
  logout() {
    this.token = null;
    this.changed = true;
    localStorage.removeItem('token');
  }

  /**
   * Change entry content.
   * @param {Object} entry
   * @param {Object} data
   */
  async saveEntry(entry, data) {
    const path = '/db/' + this.db + '/entry/' + (entry.id || '');

    // Compile fields to DB format.
    let write = {};
    // Create new entry, if no ID.
    if (!entry.id) {
      Object.assign(write, toJS(entry));
    }
    Object.assign(write, data);

    if ('tags' in data) {
      if (data.tags.length) {
        write.description = '[' + data.tags.join('][') + '] ' + data.description;
      } else {
        write.description = data.description || '';
      }
    }
    // Clean up trash.
    delete write.name;
    delete write.number;
    delete write.tags;

    return this.request(path, entry.id ? 'PATCH' : 'POST', write)
      .then((res) => {
        runInAction(() => {
          if (!entry.id) {
            entry.id = res.id;
          }
          Object.assign(entry, data);
          // Fix account number and name if missing or changed.
          entry.number = this.accountsById[entry.account_id].number;
          entry.name = this.accountsById[entry.account_id].name;
          // Fix data for copies of entries in transactions-table.
          this.transactions.forEach((tx, idx) => {
            if (entry.id === tx.entry_id) {
              Object.assign(this.transactions[idx], data);
            }
          });
        });
      });
  }

  /**
   * Handle navigation.
   * @param {String} key
   * @return {Boolean} True, if should prevent default handling.
   */
  pressKey(key) {
    let ret;
    runInAction(() => {
      ret = this.navigator.handle(key);
    });
    return ret;
  }

  /**
   * Select the current navigation target.
   * @param {String} page
   */
  selectPage(page) {

    if (this.selected.page === page) {
      return;
    }

    let component = 'Nothing', index = null, column = null, row = null;

    if (this.oldSelected[page]) {
      component = this.oldSelected[page].component;
      index = this.oldSelected[page].index;
      column = this.oldSelected[page].column;
      row = this.oldSelected[page].row;
    } else {
      switch (page) {
        case 'Balances':
          component = 'BalanceTable';
          break;
        case 'Reports':
          component = 'Nothing';
          break;
        case 'Accounts':
          component = 'Nothing';
          break;
        default:
          console.error('No default components for page', page);
      }
    }

    this.oldSelected[this.selected.page] = {
      component: this.selected.component,
      index: this.selected.index,
      column: this.selected.column,
      row: this.selected.row
    };

    this.selected.page = page;
    this.selected.component = component;
    this.selected.index = index;
    this.selected.column = column;
    this.selected.row = row;
  }

  /**
   * Check if there are changes and reset the flag.
   */
  hasChanged() {
    const ret = this.changed;
    this.changed = false;
    return ret;
  }

  /**
   * Computed property to collect only transactions matching the current filter.
   */
  @computed
  get filteredTransactions() {
    const visible = (tx) => {
      const allEnabled = Object.values(this.tools.tagDisabled).filter((v) => v).length === 0;
      if (!tx.tags || !tx.tags.length) {
        return allEnabled;
      }
      let disabled = true;
      tx.tags.forEach((tag) => {
        if (!this.tools.tagDisabled[tag]) {
          disabled = false;
        }
      });
      return !disabled;
    };

    const filter = (txs) => {
      return txs.filter((tx) => visible(tx));
    };

    return filter(this.transactions);
  }
}

export default Store;
