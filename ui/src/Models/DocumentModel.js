import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from '../Models/EntryModel';

class DocumentModel extends NavigationTargetModel {

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
      entries: []
    }, init);
  }

  getSortKey() {
    return this.number;
  }

  getId() {
    return 'Document' + this.id;
  }

  /**
   * Instantiate entries.
   * @param {Object} data
   */
  initialize(data) {
    return {...data, entries: (data.entries || []).map((e) => new EntryModel(this, e))};
  }

  /**
   * Remove an entry from this document.
   * @param {EntryModel} entry
   */
  deleteEntry(entry) {
    this.entries.replace(this.entries.filter((e) => e.id !== entry.id));
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
  get database() {
    return this.parent.database;
  }
}

export default DocumentModel;
