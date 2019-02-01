import Model from './Model';
import { observable } from 'mobx';

class PeriodModel extends Model {

  @observable
  documentsByAccountId = {};

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Starting date of the period as a string "YYYY-MM-DD".
      start_date: null,
      // Final date of the period as a string "YYYY-MM-DD".
      end_date: null,
      // If set, the period is locked and cannot be changed.
      locked: false,
      // All known documents of the period.
      documents: {}
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
    this.documents[doc.id] = doc;
    doc.entries.forEach((entry) => {
      this.documentsByAccountId[entry.account_id] = this.documentsByAccountId[entry.account_id] || new Set();
      this.documentsByAccountId[entry.account_id].add(doc.id);
    });
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
   * Get all documents involving the given account.
   * @param {Number} accountId
   * @return {DocumentModel[]}
   */
  getAccountDocuments(accountId) {
    return [...(this.documentsByAccountId[accountId] || new Set())].map((id) => this.getDocument(id));
  }
}

export default PeriodModel;
