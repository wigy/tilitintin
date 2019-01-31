import Model from './Model';

class PeriodModel extends Model {

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
  }
}

export default PeriodModel;
