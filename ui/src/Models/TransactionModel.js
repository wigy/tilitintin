import NavigationTargetModel from './NavigationTargetModel';

/**
 * Temporary model to arrange entries of the one account as a pairs of its document and the entry itself.
 */
class TransactionModel extends NavigationTargetModel {

  constructor(parent, init = {}) {
    super(parent, {
      // Order number.
      index: null,
      // Document.
      document: null,
      // Entry.
      entry: null
    }, init);
  }

  getSortKey() {
    return this.index;
  }

  /**
   * Set up the document automatically.
   */
  initialize(data) {
    return {...data, document: data.document || data.entry.document};
  }

  getId() {
    return 'Transaction' + this.index;
  }

  rows() {
    return this.document.entries;
  }

  /**
   * Get the period this document belongs to.
   */
  get period() {
    return this.document.parent;
  }

  /**
   * Get the database this document belongs to.
   */
  get database() {
    return this.document.parent.database;
  }
}

export default TransactionModel;
