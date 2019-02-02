import { observable } from 'mobx';
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
   * Append new or override old document for this period.
   * @param {DocumentModel} doc
   */
  addDocument(doc) {
    doc.parent = this;
    this.documents[doc.id] = doc;
    doc.entries.forEach((entry) => {
      this.documentsByAccountId[entry.account_id] = this.documentsByAccountId[entry.account_id] || new Set();
      this.documentsByAccountId[entry.account_id].add(doc.id);
    });
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
    return this.db.getAccount(id);
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
   * Get the database this period belongs to.
   */
  get db() {
    return this.parent;
  }
}

export default PeriodModel;
