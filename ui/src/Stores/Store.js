import { runInAction, computed, observable } from 'mobx';
import config from '../Configuration';
import AccountModel from '../Models/AccountModel';
import DatabaseModel from '../Models/DatabaseModel';
import PeriodModel from '../Models/PeriodModel';
import DocumentModel from '../Models/DocumentModel';
import EntryModel from '../Models/EntryModel';
import BalanceModel from '../Models/BalanceModel';
import TagModel from '../Models/TagModel';
import HeadingModel from '../Models/HeadingModel';
import ReportModel from '../Models/ReportModel';
import TransactionModel from '../Models/TransactionModel';

const DEBUG = false;

const debug = (...args) => DEBUG && console.log.apply(console, args);

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
 *       headings: {
 *         "1001": [{
 *           "text": "Vastaavaa",
 *           "level": 0
 *         },...]
 *       },
 *       reportsByFormat: {
 *         "general-ledger": {
 *            format: 'general-ledger',
 *            meta: {
 *              businessName: "Name of the business",
 *              businessId: "12121212-3"
 *            },
 *            'options': {
 *              compact: 'boolean'
 *            },
 *            'config': {
 *              compact: 'true'
 *            },
 *            columns: [{name, title, ...}, ...],
 *            data: []
 *         },
 *       },
 *     },
 *     bar: {
 *       name: "bar",
 *       ...
 *     }
 *   },
 *   db: 'foo',               // Currently selected db
 *   periodId: 1,             // Currently selected period
 *   accountId: 123,          // Currently selected account
 *   report: {...},           // Latest report fetched
 *   lastDate: "2018-01-01",  // Latest date entered by user.
 *   tools: {                 // Tool panel selections.
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   }
 * }
 */
class Store {

  @observable db = null;
  @observable periodId = null;
  @observable accountId = null;
  @observable changed = false;
  @observable dbsByName = {};
  @observable lastDate = null;
  @observable report = null;
  @observable tags = {};
  @observable token = localStorage.getItem('token');
  @observable tools = { tagDisabled: {} };

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

    debug('  Request:', method, config.API_URL + path, data || '');

    return fetch(config.API_URL + path, options)
      .then(res => {
        this.changed = true;
        if ([200, 201, 202, 204].includes(res.status)) {
          if (DEBUG) {
            debug('    OK:', method, config.API_URL + path, data || '');
          }
          return res.status === 200 ? res.json() : null;
        } else {
          if (DEBUG) {
            debug('    Fail:', method, config.API_URL + path, data || '');
          }
          throw new Error(res.status + ' ' + res.statusText);
        }
      });
  }

  /**
   * Get the list of available databases.
   */
  async fetchDatabases() {
    if (!this.token) {
      return;
    }
    if (Object.keys(this.dbsByName).length) {
      return;
    }
    if (!this.dbsFetch) {
      this.dbsFetch = this.request('/db')
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
          this.dbsFetch = null;
        });
    }
    return this.dbsFetch;
  }

  /**
   * Set the current database.
   * @param {String} db
   * @return {Promise}
   */
  async setDb(db) {
    db = db || null;
    if (this.db === db) {
      debug('SetDb:', db, 'using old');
      return;
    }
    await this.fetchDatabases();
    if (!this.dbFetch) {
      debug('SetDb', db, 'fetching...');
      this.dbFetch = this.fetchPeriods(db)
        .then(() => this.fetchReports(db))
        .then(() => this.fetchTags(db))
        .then(() => this.fetchHeadings(db))
        .then(() => this.fetchAccounts(db))
        .then(() => (this.dbFetch = null))
        .then(() => (this.db = db))
        .then(() => debug('SetDb', db, 'Done'));
    } else {
      debug('SetDb', db, 'sharing...');
    }
    return this.dbFetch;
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Promise}
   */
  async setPeriod(db, periodId) {
    periodId = parseInt(periodId) || null;
    if (this.db === db && this.periodId === periodId) {
      debug('SetPeriod:', db, periodId, 'using old');
      return;
    }
    await this.setDb(db);
    if (!periodId) {
      return;
    }
    if (!this.periodFetch) {
      debug('SetPeriod:', db, periodId, 'fetching...');
      this.periodFetch = this.fetchBalances(db, periodId)
        .then(() => (this.periodFetch = null))
        .then(() => (this.periodId = periodId))
        .then(() => debug('SetPeriod', db, periodId, 'Done'));
    } else {
      debug('SetPeriod:', db, periodId, 'sharing...');
    }
    return this.periodFetch;
  }

  /**
   * Set the current period.
   * @param {String} db
   * @param {Number} periodId
   * @return {Promise}
   */
  async setAccount(db, periodId, accountId) {
    // TODO: Need to get rid of this hack.
    if (accountId === 'none') {
      return;
    }
    periodId = parseInt(periodId) || null;
    accountId = parseInt(accountId) || null;
    if (this.db === db && this.periodId === periodId && this.accountId === accountId) {
      debug('SetAccount:', db, periodId, accountId, 'using old');
      return;
    }
    await this.setPeriod(db, periodId);
    if (!this.accountFetch) {
      this.accountFetch = this.fetchAccountPeriod(db, periodId, accountId)
        .then(() => (this.accountFetch = null))
        .then(() => (this.accountId = accountId))
        .then(() => debug('SetAccount:', db, periodId, accountId, 'Done'));
    }
    return this.accountFetch;
  }

  /**
   * Clear DB data.
   */
  clearDb() {
    this.changed = true;

    this.db = null;
    this.report = null;
    this.clearPeriod();
  }

  /**
   * Clear period data.
   */
  clearPeriod() {
    this.changed = true;

    this.periodId = null;
    this.report = null;
    this.clearAccount();
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
   * Get the list of periods available for the current DB.
   */
  async fetchPeriods(db) {
    return this.request('/db/' + db + '/period')
      .then((periods) => {
        runInAction(() => {
          periods.forEach((data) => {
            this.dbsByName[db].addPeriod(new PeriodModel(this.dbsByName[db], data));
          });
        });
      });
  }

  /**
   * Get the tag definitions from the current database.
   */
  async fetchTags(db) {
    return this.request('/db/' + db + '/tags')
      .then((tags) => {
        runInAction(() => {
          tags.forEach((tag) => (this.dbsByName[db].addTag(new TagModel(this.dbsByName[db], tag))));
        });
      });
  }

  /**
   * Collect all accounts.
   */
  async fetchAccounts(db) {
    return this.request('/db/' + db + '/account')
      .then((accounts) => {
        // TODO: Hmm, maybe not good solution for unwanted tag reset but.
        if (this.dbsByName[db].hasAccounts()) {
          return;
        }
        runInAction(() => {
          accounts.forEach((data) => {
            const account = new AccountModel(this.dbsByName[db], data);
            this.dbsByName[db].addAccount(account);
          });
        });
      });
  }

  /**
   * Collect all account headings.
   */
  async fetchHeadings(db) {
    return this.request('/db/' + db + '/heading')
      .then((headings) => {
        runInAction(() => {
          headings.forEach((heading) => {
            this.dbsByName[db].addHeading(new HeadingModel(this.dbsByName[db], heading));
          });
        });
      });
  }

  /**
   * Get the list of report formats available for the current DB.
   */
  async fetchReports(db) {
    return this.request('/db/' + db + '/report')
      .then((reports) => {
        runInAction(() => {
          Object.keys(reports.links).forEach((format, idx) => {
            const opts = {format, order: idx, options: reports.options[format] || {}};
            this.dbsByName[db].periods.forEach((period) => period.addReport(new ReportModel(period, opts)));
          });
        });
      });
  }

  /**
   * Get the list of report formats available for the current DB.
   */
  async fetchReport(db, periodId, format) {
    await this.setPeriod(db, periodId);
    if (!this.period) {
      return;
    }
    const report = this.period.getReport(format);
    const url = report.getUrl();
    if (this.report && this.report.url === url) {
      return;
    }
    runInAction(() => {
      report.setData(url, []);
    });
    return this.request(url)
      .then((data) => {
        runInAction(() => {
          report.setData(url, data);
          this.report = report;
        });
      });
  }

  /**
   * Get the summary of balances for all accounts in the current period.
   */
  async fetchBalances(db, periodId) {
    return this.request('/db/' + db + '/period/' + periodId)
      .then((balances) => {
        runInAction(() => {
          const period = this.dbsByName[db].getPeriod(periodId);
          period.balances = {};
          balances.balances.forEach((data) => {
            period.addBalance(new BalanceModel(period, {account_id: data.id, ...data}));
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
    return this.request('/db/' + db + '/account/' + accountId + '/' + periodId)
      .then((data) => {
        runInAction(() => {
          const account = this.dbsByName[db].getAccount(data.id);
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
    this.periodId = null;
    this.changed = true;
  }
  /**
   * Change transaction content.
   * @param {Object} tx
   * @param {Object} data
   */
  async OLDsaveDocument(tx, data) {
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
   * @param {EntryModel} entry
   */
  async saveEntry(entry) {
    return this.request('/db/' + this.db + '/entry/' + (entry.id || ''), entry.id ? 'PATCH' : 'POST', entry.toJSON())
      .then((res) => {
        runInAction(() => {
          if (!entry.id) {
            entry.id = res.id;
          }
        });
        // TODO: Here or elsewhere?
        // return this.fetchBalances();
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
          this.period.deleteEntry(entry);
        });
        return this.fetchBalances(this.db, this.periodId);
      });
  }

  /**
   * Remove a document and all of its entries from the system.
   * @param {Object} doc
   */
  async deleteDocument(doc) {
    const path = '/db/' + this.db + '/document/' + doc.id;
    return this.request(path, 'DELETE')
      .then(() => {
        runInAction(() => {
          this.period.deleteDocument(doc);
        });
        return this.fetchBalances(this.db, this.periodId);
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

    return filter(this.transactions).map((entry, index) => new TransactionModel(entry.parent.parent, {entry, document: entry.parent, index}));
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

  /**
   * Get headings data from database
   */
  @computed
  get headings() {
    return this.database ? this.database.headings : {};
  }

  /**
   * Get reports for the current period.
   */
  @computed
  get reports() {
    return this.period ? this.period.reports : [];
  }
}

export default Store;
