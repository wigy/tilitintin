import { computed, observable } from 'mobx';
import ReportModel from './ReportModel';
import DocumentModel from './DocumentModel';
import Model from './Model';

class PeriodModel extends Model {

  // All documents of this period.
  @observable
  documentsByAccountId = {};
  // All known account balances of the period.
  @observable
  balances = {};
  // All known documents of the period.
  @observable
  documents = {};
  // All reports for the period.
  @observable
  reportsByFormat = {};

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Starting date of the period as a string "YYYY-MM-DD".
      start_date: null,
      // Final date of the period as a string "YYYY-MM-DD".
      end_date: null,
      // If set, the period is locked and cannot be changed.
      locked: false
    }, init);
  }

  getSortKey() {
    return this.start_date;
  }

  /**
   * Create a document from the JSON-structure and append to this period.
   * @param {Object} data
   *
   * Data needs to be in the format
   * ```
   * {
   *   number: 123,
   *   date: "yyyy-mm-dd",
   *   entries: [{...}, ....]
   * }
   * ```
   * where entries are in the format required by `DocumentModel.createEntry()`.
   */
  async createDocument(data) {
    // Create document.
    const entries = data.entries || [];
    delete data.entries;
    const doc = new DocumentModel(this, {...data, period_id: this.id});
    this.addDocument(doc);
    await doc.save();
    // Create entries.
    for (const entry of entries) {
      await doc.createEntry(entry);
    }
    return doc;
  }

  /**
   * Append new or override old document for this period.
   * @param {DocumentModel} doc
   */
  addDocument(doc) {
    doc.parent = this;
    doc.period_id = this.id;
    this.documents[doc.id] = doc;
    doc.entries.forEach((entry) => {
      this.addEntry(entry);
    });
  }

  /**
   * Establish account linking with entry.
   * @param {EntryModel} entry
   */
  addEntry(entry) {
    if (!entry.document || !entry.document.id || !entry.account_id) {
      return;
    }
    this.documentsByAccountId[entry.account_id] = this.documentsByAccountId[entry.account_id] || new Set();
    this.documentsByAccountId[entry.account_id].add(entry.document.id);
  }

  /**
   * Remove a document from this period.
   * @param {DocumentModel} doc
   */
  deleteDocument(doc) {
    const accounts = new Set();
    doc.entries.forEach((entry) => {
      accounts.add(entry.account_id);
      if (this.documentsByAccountId[entry.account_id]) {
        this.documentsByAccountId[entry.account_id].delete(doc.id);
      }
    });
    delete this.documents[doc.id];
  }

  /**
   * Remove an entry from this period.
   * @param {EntryModel} entry
   */
  deleteEntry(entry) {
    if (entry.account_id) {
      for (let docId of this.documentsByAccountId[entry.account_id]) {
        this.getDocument(docId).deleteEntry(entry);
      }
    }
  }

  /**
   * Add new or override old balance for the given account.
   * @param {BalanceModel} balance
   */
  addBalance(balance) {
    balance.parent = this;
    this.balances[balance.account_id] = balance;
  }

  /**
   * Get balance by account ID.
   * @param {Number} accountId
   */
  getBalance(accountId) {
    return this.balances[accountId];
  }

  /**
   * Get balance by account number.
   * @param {String} number
   */
  getBalanceByNumber(number) {
    return this.getBalance(this.database.getAccountByNumber(number).id);
  }

  /**
   * Add a report for this period.
   * @param {ReportModel} report
   */
  addReport(report) {
    report.parent = this;
    this.reportsByFormat[report.format] = report;
  }

  /**
   * Get the report by its format.
   * @param {String} format
   */
  getReport(format) {
    return this.reportsByFormat[format] || null;
  }

  /**
   * Get the document by its ID.
   * @param {Number} id
   * @return {null|DocumentModel}
   */
  getDocument(id) {
    return this.documents[id] || null;
  }

  /**
   * Get the account by its ID.
   * @param {Number} id
   * @return {null|AccountModel}
   */
  getAccount(id) {
    return this.database.getAccount(id);
  }

  /**
   * Get all documents involving the given account.
   * @param {Number} accountId
   * @return {DocumentModel[]}
   */
  getAccountDocuments(accountId) {
    return [...(this.documentsByAccountId[accountId] || new Set())].map((id) => this.getDocument(id));
  }

  /**
   * Get currently loaded documents having entry for accounts and matching the filter.
   * @param {String[]} [accounts]
   * @param {Function<EntryModel>} [filter]
   * @return {DocumentModel[]}
   */
  getDocuments(accounts = null, filter = null) {
    let docs = Object.values({...this.documents});
    if (accounts !== null) {
      docs = docs.filter((doc) => {
        for (const entry of doc.entries) {
          if (accounts.includes(entry.account.number)) {
            return filter === null ? true : filter(entry);
          }
        }
        return false;
      });
    }
    return docs;
  }

  /**
   * Update tags for all accounts from the current documents.
   */
  refreshTags() {
    const tags = {};
    Object.values(this.documents).forEach((doc) => {
      doc.entries.forEach((entry) => {
        tags[entry.account_id] = tags[entry.account_id] || new Set();
        entry.tagNames.forEach((tag) => tags[entry.account_id].add(tag));
      });
    });
    Object.keys(tags).forEach((accountId) => {
      this.getAccount(accountId).setTags([...tags[accountId]]);
    });
  }

  /**
   * Lock the period.
   */
  lock() {
    this.store.request(`/db/${this.database.name}/period/${this.id}`, 'PATCH', {locked: 1})
      .then(() => {
        this.locked = 1;
      });
  }

  /**
   * Unlock the period.
   */
  unlock() {
    this.store.request(`/db/${this.database.name}/period/${this.id}`, 'PATCH', {locked: 0})
      .then(() => {
        this.locked = 0;
      });
  }

  /**
   * Calculate sum of unprocessed payable and receivable for VAT.
   * @return {Object} An object with `sales` and `purchases`.
   */
  @computed
  get VATSummary() {
    let sales = 0;
    let purchases = 0;
    const { VAT_SALES_ACCOUNT, VAT_PURCHASES_ACCOUNT } = this.settings;

    this.openVATDocuments.forEach((doc) => {
      doc.entries.forEach((entry) => {
        const acc = entry.account.number;
        if (acc === VAT_SALES_ACCOUNT) {
          sales += entry.total;
        }
        if (acc === VAT_PURCHASES_ACCOUNT) {
          purchases += entry.total;
        }
      });
    });
    return {sales, purchases};
  }

  /**
   * Gather documents with non-reconciled VAT entries.
   */
  @computed
  get openVATDocuments() {
    const { VAT_SALES_ACCOUNT, VAT_PURCHASES_ACCOUNT } = this.settings;
    return this.store.getDocuments([VAT_SALES_ACCOUNT, VAT_PURCHASES_ACCOUNT], (entry) => !entry.VAT_RECONCILED && !entry.VAT_IGNORE);
  }

  /**
   * Gather change proposals for incorrectly numbered documents.
   */
  @computed
  get incorrectlyNumberedDocuments() {
    let next = 0;
    const changed = [];
    const docs = Object.values(this.documents).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.number - b.number);
    docs.forEach((doc) => {
      if (doc.number !== next) {
        changed.push({
          id: doc.id,
          date: doc.date,
          number: doc.number,
          newNumber: next
        });
      }
      next++;
    });
    return changed;
  }

  /**
   * Get the database this period belongs to.
   */
  get database() {
    return this.parent;
  }

  /**
   * Get reports for this period.
   */
  get reports() {
    return Object.values(this.reportsByFormat).sort(ReportModel.sorter());
  }
}

export default PeriodModel;
