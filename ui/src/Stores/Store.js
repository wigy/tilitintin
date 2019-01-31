import { runInAction, computed, toJS, observable } from 'mobx';
import clone from 'clone';
import config from '../Configuration';
import AccountModel from '../Models/AccountModel';
import PeriodModel from '../Models/PeriodModel';
import DocumentModel from '../Models/DocumentModel';

/**
 * The store structure is the following:
 * {
 *   token: null
 *   dbs: ['dbname1', 'dbname2'],
 *   db: 'currentdb',
 *   periodId: 1,
 *   accountId: 123,
 *   lastDate: "2018-01-01", // Latest date entered by user.
 *   tags: {
 *     "Tag":
 *       id: 1,
 *       tag: "Tag",
 *       name: "Tag description",
 *       picture: "https://site.to.store/picture",
 *       type: "Category",
 *       order: 102,
 *   },
 *   periodsById: {
 *     1: {
 *       id: 1,
 *       start_date: "2016-12-31T22:00:00.000Z",
 *       "end_date": "2017-12-30T22:00:00.000Z",
 *       "locked": 0
 *     }
 *   }
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
 *   accountsById: {
 *     123: {
 *       id: 123,
 *       name: "Muiden vapaaehtoisten varausten muutos",
 *       number: "9890",
 *       type: "EXPENSE",
 *       tags: ["Tag1", "Tag2"],
 *     }
 *   },
 *   headings: {
 *     "1001": [{
 *       "text": "Vastaavaa",
 *       "level": 0
 *     },...]
 *   },
 *   transactionsById: {
 *     1: {                    // periodId
 *       123: [                // accountId
 *         {
 *           id: 158,
 *           number: 5,           // Document number.
 *           period_id: 1,
 *           date: "2017-07-31",
 *           open: false, // If UI has opened entries.
 *           entries: [
 *             {
 *               id: 99,
 *               account_id: 123,
 *               amount: 30000,
 *               debit: 1,
 *               description: "Sell thing",
 *               document_id: 158,
 *               flags: 0,
 *               row_number: 1,
 *               tags: []
 *             }
 *           ],
 *         },
 *         ...
 *       ]
 *     }
 *   },
 *   tools: {
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   },
 *   reports: [...], // Available report identifiers.
 *   reportOptionsAvailable: { // Report options available per report identifier.
 *    'general-ledger': {
 *      compact: 'boolean'
 *    }
 *   },
 *   reportOptions: { // Report options selected.
 *     compact: true
 *   },
 *   report: {
 *     format: 'income-statement',
 *     meta: {
 *       businessName: "Name of the business",
 *       businessId: "12121212-3"
 *     }
 *     columns: [{name, title, ...}, ...],
 *     data: []
 *   } // Current report.
 * }
 */
class Store {

  @observable accountId = null;
  @observable accountsById = {};
  @observable balances = [];
  @observable changed = false;
  @observable db = null;
  @observable dbs = [];
  @observable headings = {};
  @observable lastDate = null;
  @observable periodId = null;
  @observable periodsById = {};
  @observable report = null;
  @observable reportOptions = {};
  @observable reportOptionsAvailable = {};
  @observable reports = [];
  @observable tags = {};
  @observable token = localStorage.getItem('token');
  @observable tools = { tagDisabled: {} };
  @observable transactions = [];

  constructor() {
    // Promises for ongoing GET requests.
    this.pending = {};
    this.fetchDatabases();
  }

  /**
   * Make a HTTP request to the back-end.
   * @param {String} path
   * @param {String} method
   * @param {Object} data
   */
  async request(path, method = 'GET', data = null) {
    let options = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (this.token) {
      options.headers.Authorization = 'Bearer ' + this.token;
    }
    if (data !== null) {
      options.body = JSON.stringify(data);
    }

    let promise;

    if (method === 'GET' && this.pending[path]) {
      return this.pending[path];
    }

    promise = fetch(config.API_URL + path, options)
      .then(res => {
        this.changed = true;
        if ([200, 201, 202, 204].includes(res.status)) {
          return res.status === 200 ? res.json() : null;
        } else {
          throw new Error(res.status + ' ' + res.statusText);
        }
      })
      .finally(() => {
        if (method === 'GET') {
          delete this.pending[path];
        }
      });

    if (method === 'GET') {
      this.pending[path] = promise;
    }

    return promise;
  }

  /**
   * Set the current database.
   * @param {String} db
   * @return {Boolean} True if no changes needed.
   */
  setDb(db) {
    db = db || null;
    if (this.db === db) {
      return true;
    }
    this.clearDb();
    this.db = db;
    if (db) {
      this.fetchPeriods()
        .then(() => this.fetchReports())
        .then(() => this.fetchTags())
        .then(() => this.fetchHeadings())
        .then(() => this.fetchAccounts());
    }
    return false;
  }

  /**
   * Clear DB data.
   */
  clearDb() {
    this.changed = true;

    this.db = null;
    this.accountsById = {};
    this.periodsById = {};
    this.headings = {};
    this.tags = {};
    this.reports = [];
    this.report = null;
    this.clearPeriod();
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Boolean} True if no changes needed.
   */
  setPeriod(db, periodId) {
    periodId = parseInt(periodId) || null;
    if (this.setDb(db) && this.periodId === periodId) {
      return true;
    }
    this.clearPeriod();
    this.periodId = periodId;
    if (periodId) {
      this.fetchBalances();
    }
    return false;
  }

  /**
   * Clear period data.
   */
  clearPeriod() {
    this.changed = true;

    this.periodId = null;
    this.balances = [];
    this.clearAccount();
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Boolean} True if no changes needed.
   */
  setAccount(db, periodId, accountId) {
    if (accountId === 'none') {
      return true;
    }
    accountId = accountId || null;
    if (this.setPeriod(db, periodId) && this.accountId === accountId) {
      return true;
    }
    this.clearAccount();
    this.accountId = accountId;
    if (accountId) {
      this.fetchAccountPeriod(db, periodId, accountId);
    }
    return false;
  }

  /**
   * Clear period data.
   */
  clearAccount() {
    this.changed = true;

    this.accountId = null;
    this.transactions = [];
    this.tools = {
      tagDisabled: {
      }
    };
  }

  /**
   * Get the tag definitions from the current database.
   */
  async fetchTags() {
    return this.request('/db/' + this.db + '/tags')
      .then((tags) => {
        runInAction(() => {
          this.tags = {};
          tags.forEach((tag) => (this.tags[tag.tag] = tag));
        });
      });
  }

  /**
   * Get the list of available databases.
   */
  async fetchDatabases() {
    if (!this.token) {
      return Promise.resolve([]);
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
  async fetchPeriods() {
    return this.request('/db/' + this.db + '/period')
      .then((periods) => {
        runInAction(() => {
          this.periodsById = {};
          periods.forEach((data) => {
            const period = new PeriodModel(this, data);
            this.periodsById[period.id] = period;
          });
        });
      });
  }

  /**
   * Get the list of report formats available for the current DB.
   */
  async fetchReports() {
    return this.request('/db/' + this.db + '/report')
      .then((reports) => {
        runInAction(() => {
          this.reports = Object.keys(reports.links);
          this.reportOptionsAvailable = reports.options;
          this.reportOptions = {};
        });
      });
  }

  /**
   * Get the list of report formats available for the current DB.
   */
  async fetchReport(db, periodId, format) {
    const options = Object.keys(this.reportOptions).map((key) => `${key}=${encodeURIComponent(JSON.stringify(this.reportOptions[key]))}`);
    const url = '/db/' + db + '/report/' + format + '/' + periodId + (options.length ? '?' + options.join('&') : '');
    if (this.report && this.report.url === url) {
      return;
    }
    this.setPeriod(db, periodId);
    return this.request(url)
      .then((report) => {
        runInAction(() => {
          report.db = db;
          report.periodId = periodId;
          report.options = clone(this.reportOptions);
          report.url = url;
          this.report = report;
        });
      });
  }

  /**
   * Get the summary of balances for all accounts in the current period.
   */
  async fetchBalances() {
    return this.request('/db/' + this.db + '/period/' + this.periodId)
      .then((balances) => {
        runInAction(() => {
          this.balances = [];
          balances.balances.forEach((balance) => {
            this.balances.push(balance);
          });
        });
      });
  }

  /**
   * Collect all accounts.
   */
  async fetchAccounts() {
    return this.request('/db/' + this.db + '/account')
      .then((accounts) => {
        // TODO: Hmm, maybe not good solution for unwanted tag reset but.
        if (Object.keys(this.accountsById).length) {
          return;
        }
        runInAction(() => {
          accounts.forEach((data) => {
            const account = new AccountModel(this, data);
            this.accountsById[account.id] = account;
          });
        });
      });
  }

  /**
   * Collect all account headings.
   */
  async fetchHeadings() {
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
  async fetchAccountPeriod(db, periodId, accountId) {

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

    if (!Object.keys(this.accountsById).length) {
      await this.fetchAccounts();
    }

    return this.request('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((data) => {
        runInAction(() => {
          const account = this.accountsById[data.id];
          this.transactions = data.transactions;
          let tags = {};
          let lastDate;
          this.transactions.forEach((tx) => {
            const doc = new DocumentModel(this.periodsById[tx.period_id], tx);
            this.periodsById[this.periodId].addDocument(doc);
            lastDate = tx.date;
            const [txDesc, txTags] = desc2tags(tx.description);
            tx.description = txDesc;
            tx.tags = txTags;
            tx.tags.forEach((tag) => (tags[tag] = true));
            tx.open = false;
            tx.entries.forEach((entry) => {
              const [entryDesc, entryTags] = desc2tags(entry.description);
              entry.description = entryDesc;
              entry.tags = entryTags;
            });
          });
          this.lastDate = lastDate;
          account.addTags(Object.keys(tags));
        });
      });
  }

  /**
   * Sort the given list (or current account's) of tags to their official order.
   * @param {Array<Object>|null} tags
   * TODO: Models should handle this.
   */
  sortTags(tags = null) {
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
  async login(user, password) {
    this.token = null;
    return this.request('/auth', 'POST', {user: user, password: password})
      .then((resp) => {
        if (resp && resp.token) {
          runInAction(() => {
            this.token = resp.token;
            localStorage.setItem('token', resp.token);
            this.fetchDatabases();
          });
        }
      });
  }

  /**
   * Log out the current user.
   */
  logout() {
    localStorage.removeItem('token');
    this.token = null;
    this.dbs = [];
    this.db = null;
    this.periods = [];
    this.periodId = null;
    this.changed = true;
  }
  /**
   * Change transaction content.
   * @param {Object} tx
   * @param {Object} data
   */
  async saveDocument(tx, data) {
    let write = {
      period_id: tx.period_id || this.periodId
    };
    if (data.date) {
      write.date = data.date;
    }

    return this.request('/db/' + this.db + '/document/' + (tx.id ? tx.id : ''), tx.id ? 'PATCH' : 'POST', write)
      .then((res) => {
        runInAction(() => {
          if (res) {
            Object.assign(tx, res);
          } else if (data.date) {
            tx.date = data.date;
          }
          // TODO: This should be done but UI is not tracking correctly the sudden order change.
          //       Maybe enable this once the proper class structure is established and cursor selection
          //       is carried around in the model itself.
          // const sorted = this.transactions.slice().sort((a, b) => (a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)));
          // this.transactions.replace(sorted);
        });
      });
  }

  /**
   * Change entry content.
   * @param {Object} entry
   * @param {Object} data
   * @param {Object} tx
   */
  async saveEntry(entry, data, tx) {

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

    return this.request('/db/' + this.db + '/entry/' + (entry.id || ''), entry.id ? 'PATCH' : 'POST', write)
      .then((res) => {
        runInAction(() => {
          if (!entry.id) {
            entry.id = res.id;
            // Update also tx, if it is freshly created.
            if (!tx.entry_id) {
              tx.entry_id = res.id;
            }
          }
          Object.assign(entry, data);
          // Fix account number and name if missing or changed and we have account.
          if (entry.account_id) {
            entry.number = this.accountsById[entry.account_id].number;
            entry.name = this.accountsById[entry.account_id].name;
          }
          // Fix data for copies of entries in transactions-table.
          this.transactions.forEach((tx, idx) => {
            // If account ID has changed, leave transaction as it is.
            if (entry.id === tx.entry_id && entry.account_id === tx.account_id) {
              Object.assign(this.transactions[idx], data);
            }
          });
          // TODO: Once we have better class structure, update directly balances collection.
          this.fetchBalances();
        });
      });
  }

  /**
   * Remove an entry.
   * @param {Object} entry
   */
  async deleteEntry(entry) {
    const path = '/db/' + this.db + '/entry/' + entry.id;
    return this.request(path, 'DELETE')
      .then(() => {
        runInAction(() => {
          this.transactions.forEach((tx, idx) => {
            for (let i = 0; i < tx.entries.length; i++) {
              if (tx.entries[i].id === entry.id) {
                tx.entries.splice(i, 1);
                i--;
              }
            }
          });
          // TODO: Once we have better class structure, update directly balances collection.
          this.fetchBalances();
        });
      });
  }

  /**
   * Remove a transaction and all of its entries from the system.
   * @param {Object} tx
   */
  async deleteTransaction(tx) {
    const path = '/db/' + this.db + '/document/' + tx.id;
    return this.request(path, 'DELETE')
      .then(() => {
        runInAction(() => {
          const remaining = this.transactions.filter((t) => t.id !== tx.id);
          this.transactions.replace(remaining);
          // TODO: Once we have better class structure, update directly balances collection.
          this.fetchBalances();
        });
      });
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
   * Find a text proposal from earlier entries.
   * @param {Object} entry
   * @param {String} value
   */
  descriptionProposal(entry, value) {
    const texts = new Set();
    this.transactions.forEach((tx, idx) => {
      for (let i = 0; i < tx.entries.length; i++) {
        if (tx.entries[i].account_id === entry.account_id && tx.entries[i].id !== entry.id) {
          texts.add(tx.entries[i].description);
        }
      }
    });
    const candidates = [...texts].sort();
    value = value.trim();
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].startsWith(value)) {
        return candidates[i];
      }
    }
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

  /**
   * Get a list of accounts sorted by their number.
   */
  @computed
  get accounts() {
    return Object.values(this.accountsById).sort(AccountModel.sorter());
  }

  /**
   * Get a list of periods sorted by their id.
   */
  @computed
  get periods() {
    return Object.values(this.periodsById).sort(PeriodModel.sorter(true));
  }

  /**
   * Get the currently selected account if any.
   */
  @computed
  get account() {
    if (this.accountId) {
      return this.accountsById[this.accountId] || {};
    }
    return {};
  }
}

export default Store;
