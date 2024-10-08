import { runInAction, computed, observable, makeObservable, action } from 'mobx'
import config from '../Configuration'
import AccountModel from '../Models/AccountModel'
import DatabaseModel from '../Models/DatabaseModel'
import PeriodModel from '../Models/PeriodModel'
import DocumentModel from '../Models/DocumentModel'
import EntryModel from '../Models/EntryModel'
import BalanceModel from '../Models/BalanceModel'
import TagModel from '../Models/TagModel'
import HeadingModel from '../Models/HeadingModel'
import ReportModel from '../Models/ReportModel'
import i18n from '../i18n'
import jwtDecode from 'jwt-decode'

const DEBUG = false
let NEXT_MESSAGE_ID = 1

const debug = (...args) => DEBUG && console.log.apply(console, args)

/**
 * The store structure is the following:
 * {
 *   token: null,
 *   messages: [
 *     { id: 1, text: 'This is alert.' }
 *   ],
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
 *       }
 *     }
 *   },
 *   db: 'foo',                // Currently selected db
 *   periodId: 1,              // Currently selected period
 *   accountId: 123,           // Currently selected account
 *   report: ReportModel(...), // Latest report fetched
 *   lastDate: "2018-01-01",   // Latest date entered by user.
 *   tools: {                  // Tool panel selections.
 *     tagDisabled: {
 *       Tag1: true,
 *       Tag2: false
 *     }
 *   },
 *   users: [{
 *
 *   }]
 * }
 */
class Store {

  @observable db = null
  @observable loading = false
  @observable messages = []
  @observable periodId = null
  @observable accountId = null
  @observable changed = false
  @observable dbsByName = {}
  @observable lastDate = null
  @observable report = null
  @observable tags = {}
  @observable token = localStorage.getItem('token')
  @observable tools = { tagDisabled: {}, accounts: {} }
  @observable users = []

  // Cache for account descriptions list.
  entryDescriptions = {};

  constructor(settings) {
    this.settings = settings
    makeObservable(this)
  }

  /**
   * Make a HTTP request to the back-end.
   * @param {String} path
   * @param {String} method
   * @param {Object|null|undefined} data
   * @param {File} file
   * @param {Boolean} noDimming
   */
  @action
  async request(path, method = 'GET', data = null, file = null, noDimming = false) {
    const url = config.UI_API_URL + path
    const options = {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
    if (this.token) {
      options.headers.Authorization = 'Bearer ' + this.token
    }
    if (data !== null) {
      options.body = JSON.stringify(data)
    }
    if (file !== null) {
      delete options.headers.Accept
      delete options.headers['Content-Type']
      options.body = new FormData()
      options.body.set('file', file)
      options.mode = 'cors'
    }

    debug('  Request:', method, url, data || '')

    this.loading = !noDimming
    return fetch(url, options)
      .then(res => {
        runInAction(() => {
          this.loading = false
        })
        if ([200, 201, 202, 204].includes(res.status)) {
          debug('    OK:', method, url, data || '')
          return res.status === 200 ? res.json() : true
        } else if (res.status === 401) {
          this.addError(i18n.t('Invalid credentials.'))
          this.logout()
        } else if (res.status === 403) {
          return undefined
        } else {
          debug('    Fail:', method, url, data || '')
          res.json().then((response) => {
            this.addError(i18n.t(response.message))
          })
            .catch(err => {
              throw new Error(`Request ${method} ${url} failed with ${err} and no error message received.`)
            })
        }
      })
  }

  /**
   * Get the list of available databases.
   */
  @action
  async fetchDatabases(force = false) {
    if (!this.token) {
      return
    }
    if (!force && Object.keys(this.dbsByName).length) {
      return
    }
    if (!this.dbsFetch) {
      this.dbsFetch = this.request('/db')
        .then(data => {
          runInAction(() => {
            this.dbsByName = {}
            if (data) {
              data.forEach((db) => {
                const model = new DatabaseModel(this, db)
                this.dbsByName[model.name] = model
              })
            }
          })
          this.dbsFetch = null
        })
    }
    return this.dbsFetch
  }

  /**
  * Set the current database.
  * @param {String} db
  * @return {Promise}
  */
  @action
  async setDb(db) {
    db = db || null
    if (this.db === db) {
      debug('SetDb:', db, 'using old')
      return
    }
    await this.fetchDatabases()
    if (!db) {
      return
    }
    if (!this.dbFetch) {
      debug('SetDb', db, 'fetching...')
      this.dbFetch = this.fetchSettings(db)
        .then(() => this.fetchPeriods(db))
        .then(() => this.fetchReports(db))
        .then(() => this.fetchTags(db))
        .then(() => this.fetchHeadings(db))
        .then(() => this.fetchAccounts(db))
        .then(() => runInAction(() => (this.dbFetch = null)))
        .then(() => runInAction(() => (this.db = db)))
        .then(() => debug('SetDb', db, 'Done'))
    } else {
      debug('SetDb', db, 'sharing...')
    }
    return this.dbFetch
  }

  /**
  * Set the current period.
  * @param {String} db
  * @param {Number} periodId
  * @return {Promise}
  */
  @action
  async setPeriod(db, periodId) {
    periodId = parseInt(periodId) || null
    if (this.db === db && this.periodId === periodId) {
      debug('SetPeriod:', db, periodId, 'using old')
      return
    }
    await this.setDb(db)
    if (!periodId) {
      runInAction(() => (this.periodId = null))
      return
    }
    if (!this.periodFetch) {
      debug('SetPeriod:', db, periodId, 'fetching...')
      this.invalidateReport()
      this.periodFetch = this.fetchBalances(db, periodId)
        .then(() => runInAction(() => (this.periodId = periodId)))
        .then(() => this.fetchDocuments(db, periodId))
        .then(() => runInAction(() => (this.periodFetch = null)))
        .then(() => debug('SetPeriod', db, periodId, 'Done'))
    } else {
      debug('SetPeriod:', db, periodId, 'sharing...')
    }
    return this.periodFetch
  }

  /**
  * Set the current period.
  * @param {String} db
  * @param {Number} periodId
  * @return {Promise}
  */
  @action
  async setAccount(db, periodId, accountId) {
    if (accountId === '') {
      return
    }
    periodId = parseInt(periodId) || null
    accountId = parseInt(accountId) || null
    if (this.db === db && this.periodId === periodId && this.accountId === accountId) {
      debug('SetAccount:', db, periodId, accountId, 'using old')
      return
    }
    await this.setPeriod(db, periodId)
    // Fetch additional data for an account.
    return this.request('/db/' + db + '/account/' + accountId)
      .then((account) => {
        runInAction(() => {
          this.accountId = accountId
          this.account.periods.replace(account.periods)
          debug('SetAccount:', db, periodId, accountId, 'Done')
        })
      })
  }

  /**
  * Clear DB data.
  */
  @action
  clearDb() {

    this.db = null
    this.report = null
    this.settings.reset()
    this.clearPeriod()
  }

  /**
  * Clear period data.
  */
  @action
  clearPeriod() {

    this.periodId = null
    this.report = null
    this.clearAccount()
  }

  /**
  * Clear period data.
  */
  @action
  clearAccount() {

    this.accountId = null
    this.tools = {
      tagDisabled: {
      },
      accounts: {
      }
    }
  }

  /**
  * Get the settings from the DB.
  */
  @action
  async fetchSettings(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/settings')
      .then((settings) => {
        runInAction(() => {
          this.settings.update(settings)
        })
      })
  }

  /**
  * Get the list of periods available for the current DB.
  */
  @action
  async fetchPeriods(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/period')
      .then((periods) => {
        runInAction(() => {
          periods.forEach((data) => {
            this.dbsByName[db].addPeriod(new PeriodModel(this.dbsByName[db], data))
          })
        })
      })
  }

  /**
  * Get the tag definitions from the current database.
  */
  @action
  async fetchTags(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/tags')
      .then((tags) => {
        runInAction(() => {
          tags.forEach((tag) => (this.dbsByName[db].addTag(new TagModel(this.dbsByName[db], tag))))
        })
      })
  }

  /**
  * Collect all accounts.
  */
  @action
  async fetchAccounts(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/account')
      .then((accounts) => {
        runInAction(() => {
          this.dbsByName[db].deleteAccounts()
          accounts.forEach((data) => {
            const account = new AccountModel(this.dbsByName[db], data)
            this.dbsByName[db].addAccount(account)
          })
        })
      })
  }

  /**
  * Fetch all historical descriptions given for entries of the given account.
  * @param {String} db
  * @param {Number} accountId
  * @return {String[]}
  */
  @action
  async fetchEntryProposals(db, accountId) {
    if (!this.token) {
      return
    }
    if (this.entryDescriptions[db] && this.entryDescriptions[db][accountId]) {
      return this.entryDescriptions[db][accountId]
    }
    return this.request('/db/' + db + '/entry?account_id=' + accountId, 'GET', null, null, true)
      .then((entries) => {
        const ret = entries.map(e => ({
          documentId: e.document_id,
          description: e.description,
          debit: e.debit ? e.amount : null,
          credit: e.debit ? null : e.amount
        }))
        this.entryDescriptions[db] = this.entryDescriptions[db] || {}
        this.entryDescriptions[db][accountId] = ret
        return ret
      })

  }

  /**
  * Collect all account headings.
  */
  @action
  async fetchHeadings(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/heading')
      .then((headings) => {
        runInAction(() => {
          headings.forEach((heading) => {
            this.dbsByName[db].addHeading(new HeadingModel(this.dbsByName[db], heading))
          })
        })
      })
  }

  /**
  * Get the list of report formats available for the current DB.
  */
  @action
  async fetchReports(db) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + db + '/report')
      .then((reports) => {
        runInAction(() => {
          Object.keys(reports.links).forEach((format, idx) => {
            const opts = { format, order: idx, options: reports.options[format] || {} }
            this.dbsByName[db].periods.forEach((period) => period.addReport(new ReportModel(period, opts)))
          })
        })
      })
  }

  /**
  * Get the report data.
  */
  @action
  async fetchReport(db, periodId, format) {
    await this.setPeriod(db, periodId)
    if (!this.period) {
      return
    }
    const report = this.period.getReport(format)
    const url = report.getUrl()
    if (this.report && this.report.url === url) {
      return
    }
    runInAction(() => {
      this.report = null
      report.setData(url, [])
    })
    return this.request(url)
      .then((data) => {
        runInAction(() => {
          report.setData(url, data)
          this.report = report
        })
      })
  }

  /**
  * Get the summary of balances for all accounts in the given period.
  */
  @action
  async fetchBalances(db = null, periodId = null) {
    if (!this.token) {
      return
    }
    if (!db) {
      db = this.db
    }
    if (!periodId) {
      periodId = this.periodId
    }
    return this.request('/db/' + db + '/period/' + periodId)
      .then((balances) => {
        runInAction(() => {
          const period = this.dbsByName[db].getPeriod(periodId)
          period.balances = {}
          balances.balances.forEach((data) => {
            period.addBalance(new BalanceModel(period, { account_id: data.id, ...data }))
          })
        })
      })
  }

  /**
  * Get the documents with entries for the given period.
  */
  @action
  async fetchDocuments(db = null, periodId = null) {
    if (!this.token) {
      return
    }
    if (!db) {
      db = this.db
    }
    if (!periodId) {
      periodId = this.periodId
    }
    return this.request('/db/' + db + '/document?entries&period=' + periodId)
      .then((data) => {
        runInAction(() => {
          let lastDate
          data.forEach((tx) => {
            const doc = new DocumentModel(this.period, tx)
            this.period.addDocument(doc)
            lastDate = tx.date
          })
          this.period.refreshTags()
          this.lastDate = lastDate
        })
      })
  }

  /**
  * Get a single document raw data without caching.
  */
  @action
  async fetchRawDocument(documentId) {
    if (!this.token) {
      return
    }
    return this.request('/db/' + this.db + '/document/' + documentId)
  }

  /**
  * Login to the back-end.
  * @param {String} user
  * @param {String} password
  */
  @action
  async login(user, password) {
    this.token = null
    return this.request('/auth', 'POST', { user: user, password: password })
      .then((resp) => {
        if (resp && resp.token) {
          runInAction(() => {
            this.token = resp.token
            localStorage.setItem('token', resp.token)
            this.fetchDatabases()
          })
        }
      })
  }

  /**
  * Log out the current user.
  */
  @action
  logout() {
    localStorage.removeItem('token')
    this.token = null
    this.dbsByName = {}
    this.db = null
    this.periodId = null
    this.clearDb()
  }

  /**
  * Create new database.
  * @param info.databaseName
  * @param info.companyName
  * @param info.companyCode
  */
  @action
  createDatabase(info) {
    return this.request('/db', 'POST', info)
      .then(async (res) => {
        await this.fetchDatabases(true)
        this.clearAccount()
        return res
      })
  }

  /**
  * Remove the report, since it may not be valid anymore.
  */
  @action
  invalidateReport() {
    if (this.report) {
      this.report = null
    }
  }

  /**
  * Save account data.
  * @param {AccountModel} account
  */
  @action
  async saveAccount(account) {
    return this.request('/db/' + this.db + '/account/' + (account.id || ''), account.id ? 'PATCH' : 'POST', account.toJSON())
      .then((res) => {
        runInAction(() => {
          if (!account.id) {
            account.id = res.id
          }
        })
        this.invalidateReport()
        return res
      })
  }

  /**
  * Save period content.
  * @param {PeriodModel} period
  */
  @action
  async savePeriod(period) {
    return this.request('/db/' + this.db + '/period/' + (period.id || ''), period.id ? 'PATCH' : 'POST', period.toJSON())
      .then((res) => {
        runInAction(() => {
          if (!period.id) {
            period.id = res.id
          }
        })
        this.invalidateReport()
        return res
      })
  }

  /**
  * Save transaction content.
  * @param {DocumentModel} doc
  */
  @action
  async saveDocument(doc) {
    return this.request('/db/' + this.db + '/document/' + (doc.id ? doc.id : ''), doc.id ? 'PATCH' : 'POST', doc.toJSON())
      .then((res) => {
        runInAction(() => {
          if (!doc.id) {
            doc.id = res.id
          }
          if (!doc.number) {
            doc.number = res.number
          }
          this.invalidateReport()
          return res
        })
      })
  }

  /**
  * Save entry content.
  * @param {EntryModel} entry
  */
  @action
  async saveEntry(entry) {
    if (this.entryDescriptions[this.db] && this.entryDescriptions[this.db][entry.account_id]) {
      delete this.entryDescriptions[this.db][entry.account_id]
    }
    // Remove from old account, if changed.
    if (entry.id) {
      const old = await this.request('/db/' + this.db + '/entry/' + entry.id)
      if (old.account_id !== entry.account_id) {
        entry.document.period.changeAccount(entry.document_id, old.account_id, entry.account_id)
      }
    }
    return this.request('/db/' + this.db + '/entry/' + (entry.id || ''), entry.id ? 'PATCH' : 'POST', entry.toJSON())
      .then((res) => {
        runInAction(() => {
          if (!entry.id) {
            entry.id = res.id
          }
        })
        this.invalidateReport()
        return res
      })
  }

  /**
  * Remove an account.
  * @param {AccountModel} account
  */
  @action
  async deleteAccount(account) {
    const path = '/db/' + this.db + '/account/' + account.id
    return this.request(path, 'DELETE')
      .then(() => {
        this.invalidateReport()
        return this.fetchAccounts(this.db)
      })
  }

  /**
  * Remove an entry.
  * @param {EntryModel} entry
  */
  @action
  async deleteEntry(entry) {
    if (!entry.id) {
      entry.document.entries.remove(entry)
      return
    }
    const path = '/db/' + this.db + '/entry/' + entry.id
    return this.request(path, 'DELETE')
      .then(() => {
        runInAction(() => {
          this.period.deleteEntry(entry)
        })
        this.invalidateReport()
        return this.fetchBalances(this.db, this.periodId)
      })
  }

  /**
  * Remove a document and all of its entries from the system.
  * @param {DocumentModel} doc
  */
  @action
  async deleteDocument(doc) {
    const path = '/db/' + this.db + '/document/' + doc.id
    return this.request(path, 'DELETE')
      .then(() => {
        runInAction(() => {
          this.period.deleteDocument(doc)
        })
        this.invalidateReport()
        return this.fetchBalances(this.db, this.periodId)
      })
  }

  /**
  * Remove a database.
  * @param {DatabaseModel} db
  */
  @action
  async deleteDatabase(db) {
    const path = '/db/' + db.name
    return this.request(path, 'DELETE')
  }

  /**
 * Computed property to collect only transactions matching the current filter.
 */
  @computed
  get filteredTransactions() {
    const visible = (tx) => {
      const allEnabled = Object.values(this.tools.tagDisabled).filter((v) => v).length === 0
      if (!tx.tags || !tx.tags.length) {
        return allEnabled
      }
      let disabled = true
      tx.tags.forEach((tag) => {
        if (!this.tools.tagDisabled[tag.tag]) {
          disabled = false
        }
      })
      return !disabled
    }

    const filter = (txs) => {
      return txs.filter((tx) => visible(tx))
    }

    return filter(this.transactions)
  }

  /**
   * Get currently loaded documents having entry for accounts and matching the filter.
   * @param {String[]} [accounts]
   * @param {Function<EntryModel>} [filter]
   * @return {DocumentModel[]}
   */
  getDocuments(accounts = null, filter = null) {
    if (!this.period) {
      return []
    }
    return this.period.getDocuments(accounts, filter)
  }

  /**
   * Fill in users table (admin only).
   */
  async getUsers() {
    return this.request('/admin/user')
      .then((users) => {
        runInAction(() => this.users.replace(users))
      })
  }

  /**
   * Find the given user that has been already loaded.
   */
  getUser(name) {
    return this.users.find(u => u.user === name)
  }

  /**
   * Delete user from the system.
   * @param {User} user
   */
  async deleteUser(user) {
    const path = '/admin/user/' + user.user
    return this.request(path, 'DELETE')
  }

  /**
   * Append an error message to the snackbar.
   * @param {String} text
   */
  addError(text) {
    const id = NEXT_MESSAGE_ID++
    const message = { id, text, type: 'error' }
    runInAction(() => this.messages.push(message))
    setTimeout(() => this.removeMessage(message), 5000)
  }

  /**
   * Append normal message to the snackbar.
   * @param {String} text
   */
  addMessage(text) {
    const id = NEXT_MESSAGE_ID++
    const message = { id, text, type: 'info' }
    runInAction(() => this.messages.push(message))
    setTimeout(() => this.removeMessage(message), 5000)
  }

  /**
   * Remove a message from the current list.
   */
  removeMessage(message) {
    runInAction(() => this.messages.replace(this.messages.filter(m => m.id !== message.id)))
  }

  /**
   * Remove all messages.
   */
  clearMessages() {
    runInAction(() => this.messages.replace([]))
  }

  /**
   * Get a list of all entries for the currently selected account of the current period.
   */
  @computed
  get transactions() {
    if (this.periodId && this.accountId && this.period) {
      let ret = []
      let docs = this.period.getAccountDocuments(this.accountId)
      docs = docs.sort(DocumentModel.sorter())
      docs.forEach((doc) => {
        ret = ret.concat(doc.entries.filter((e) => e.account_id === this.accountId))
      })
      return ret.sort(EntryModel.sorter())
    }
    return []
  }

  /**
   * Get a list of dbs.
   */
  @computed
  get dbs() {
    return Object.values(this.dbsByName).sort(DatabaseModel.sorter(true))
  }

  /**
   * Get the current database.
   */
  @computed
  get database() {
    return this.dbsByName[this.db] || null
  }

  /**
   * Get the current period.
   */
  @computed
  get period() {
    if (!this.database || !this.periodId) {
      return null
    }
    return this.database.periodsById[this.periodId]
  }

  /**
   * Get a list of periods sorted by their starting date.
   */
  @computed
  get periods() {
    if (!this.database) {
      return []
    }
    return Object.values(this.database.periodsById).sort(PeriodModel.sorter(true))
  }

  /**
   * Get a list of balances for the current period.
   */
  @computed
  get balances() {
    if (this.periodId && this.period) {
      return Object.values(this.period.balances).sort(BalanceModel.sorter())
    }
    return []
  }

  /**
   * Get the currently selected account if any.
   */
  @computed
  get account() {
    if (this.accountId && this.database) {
      return this.database.accountsById[this.accountId] || null
    }
    return null
  }

  /**
   * Get a list of accounts sorted by their number.
   */
  @computed
  get accounts() {
    return this.database ? Object.values(this.database.accountsById).sort(AccountModel.sorter()) : []
  }

  /**
   * Get headings data from database
   */
  @computed
  get headings() {
    return this.database ? this.database.headings : {}
  }

  /**
   * Get reports for the current period.
   */
  @computed
  get reports() {
    return this.period ? this.period.reports : []
  }

  /**
   * Get all documents for the current period.
   */
  @computed
  get documents() {
    return this.period ? this.period.getDocuments() : []
  }

  /**
   * Check if the current user is administrator.
   */
  @computed
  get isAdmin() {
    return this.token && !!jwtDecode(this.token).isAdmin
  }
}

export default Store
