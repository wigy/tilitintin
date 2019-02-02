import { runInAction, computed, toJS, observable } from 'mobx';
import clone from 'clone';
import config from '../Configuration';
import AccountModel from '../Models/AccountModel';
import DatabaseModel from '../Models/DatabaseModel';
import PeriodModel from '../Models/PeriodModel';
import DocumentModel from '../Models/DocumentModel';
import EntryModel from '../Models/EntryModel';
import BalanceModel from '../Models/BalanceModel';
import TagModel from '../Models/TagModel';

/**
 * The store structure is the following:
 * {
 *   token: null
 *   dbsByName: {
 *     foo: {
 *       name: "foo"
 *       accountsById: {
 *         123: {
 *           id: 123,
 *           name: "Muiden vapaaehtoisten varausten muutos",
 *           number: "9890",
 *           type: "EXPENSE",
 *           tags: ["Tag1", "Tag2"],
 *         }
 *       },
 *       periodsById: {
 *         1: {
 *           id: 1,
 *           start_date "2017-01-01",
 *           end_date "2017-12-31"
 *         }
 *       },
 *       tags: {
 *         "Tag":
 *           id: 1,
 *           tag: "Tag",
 *           name: "Tag description",
 *           picture: "https://site.to.store/picture",
 *           type: "Category",
 *           order: 102,
 *       },
 *     },
 *     bar: {
 *       name: "bar",
 *       ...
 *     }
 *   },
 *   db: 'foo',              // Currently selected db
 *   periodId: 1,            // Currently selected period
 *   accountId: 123,         // Currently selected account
 *   lastDate: "2018-01-01", // Latest date entered by user.
 *   TODO: Move inside DB model.
 *   headings: {
 *     "1001": [{
 *       "text": "Vastaavaa",
 *       "level": 0
 *     },...]
 *   },
 *   tools: {
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   },
 *   // TODO: Move inside DB model.
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
  @observable changed = false;
  @observable db = null;
  @observable dbsByName = {};
  @observable headings = {};
  @observable lastDate = null;
  @observable periodId = null;
  @observable report = null;
  @observable reportOptions = {};
  @observable reportOptionsAvailable = {};
  @observable reports = [];
  @observable tags = {};
  @observable token = localStorage.getItem('token');
  @observable tools = { tagDisabled: {} };

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
    this.headings = {};
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
    accountId = parseInt(accountId) || null;
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
          tags.forEach((tag) => (this.database.addTag(new TagModel(this.database, tag))));
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
      .then(data => {
        runInAction(() => {
          this.dbsByName = {};
          if (data) {
            data.forEach((db) => {
              const model = new DatabaseModel(this, db);
              this.dbsByName[model.name] = model;
            });
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
          periods.forEach((data) => {
            this.database.addPeriod(new PeriodModel(this.database, data));
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
          const period = this.period;
          period.balances = {};
          balances.balances.forEach((data) => {
            period.addBalance(new BalanceModel(period, {account_id: data.id, ...data}));
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
        if (this.database.hasAccounts()) {
          return;
        }
        runInAction(() => {
          accounts.forEach((data) => {
            const account = new AccountModel(this.database, data);
            this.database.addAccount(account);
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

    if (!this.database) {
      await this.fetchDatabases();
    }

    if (!this.database.hasAccounts()) {
      await this.fetchAccounts();
    }

    return this.request('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((data) => {
        runInAction(() => {
          const account = this.database.getAccount(data.id);
          let lastDate;
          data.transactions.forEach((tx) => {
            const doc = new DocumentModel(this.period, tx);
            this.period.addDocument(doc);
            lastDate = tx.date;
            doc.entries.forEach((entry) => {
              account.addTags([...entry.tagNames]);
            });
          });
          this.lastDate = lastDate;
        });
      });
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
    this.dbsByName = {};
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
            entry.number = this.database.getAccount(entry.account_id).number;
            entry.name = this.database.getAccount(entry.account_id).name;
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
        if (!this.tools.tagDisabled[tag.tag]) {
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
   * Get a list of all entries for the currently selected account of the current period.
   */
  @computed
  get transactions() {
    if (this.periodId && this.accountId && this.period) {
      let ret = [];
      let docs = this.period.getAccountDocuments(this.accountId);
      docs = docs.sort(DocumentModel.sorter());
      docs.forEach((doc) => {
        ret = ret.concat(doc.entries.filter((e) => e.account_id === this.accountId));
      });
      return ret.sort(EntryModel.sorter());
    }
    return [];
  }

  /**
   * Get a list of dbs.
   */
  @computed
  get dbs() {
    return Object.values(this.dbsByName).sort(DatabaseModel.sorter(true));
  }

  /**
   * Get the current database.
   */
  @computed
  get database() {
    return this.dbsByName[this.db] || null;
  }

  /**
   * Get the current period.
   */
  @computed
  get period() {
    if (!this.database || !this.periodId) {
      return null;
    }
    return this.database.periodsById[this.periodId];
  }

  /**
   * Get a list of periods sorted by their starting date.
   */
  @computed
  get periods() {
    if (!this.database) {
      return [];
    }
    return Object.values(this.database.periodsById).sort(PeriodModel.sorter(true));
  }

  /**
   * Get a list of balances for the current period.
   */
  @computed
  get balances() {
    if (this.periodId && this.period) {
      return Object.values(this.period.balances).sort(BalanceModel.sorter());
    }
    return [];
  }

  /**
   * Get the currently selected account if any.
   */
  @computed
  get account() {
    if (this.accountId && this.database) {
      return this.database.accountsById[this.accountId] || null;
    }
    return null;
  }

  /**
   * Get a list of accounts sorted by their number.
   */
  @computed
  get accounts() {
    return this.database ? Object.values(this.database.accountsById).sort(AccountModel.sorter()) : [];
  }
}

export default Store;
