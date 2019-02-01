import Model from './Model';
import EntryModel from '../Models/EntryModel';

class DocumentModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Document order number.
      number: null,
      // ID of the period this document belongs to.
      period_id: null,
      // Transaction date as a string "YYYY-MM-DD".
      date: null,
      // A list of entries of this document.
      entries: [],
      // If set, the entries are listed in UI.
      open: false
    }, init);
  }

  getSortKey() {
    return this.number;
  }

  /**
   * Instantiate entries.
   * @param {Object} data
   */
  initialize(data) {
    return {...data, entries: (data.entries || []).map((e) => new EntryModel(this, e))};
  }

  /**
   * Get the period this document belongs to.
   */
  get period() {
    return this.parent;
  }

  /**
   * Get the database this document belongs to.
   */
  get db() {
    return this.parent.db;
  }
}

export default DocumentModel;
