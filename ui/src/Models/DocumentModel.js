import Model from './Model';

class DocumentModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Document order number.
      number: null,
      // ID of the period this document belongs to.
      period_id: null,
      // Transaction date as a string "YYYY-MM-DD".
      date: null
    }, init);
  }

  getSortKey() {
    return this.number;
  }
}

export default DocumentModel;
