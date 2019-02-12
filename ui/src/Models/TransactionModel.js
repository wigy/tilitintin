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

  getId() {
    return 'Transaction' + this.index;
  }

  rows() {
    return this.document.entries;
  }

  /**
   * Mark either document or entry for deletion.
   * @param {Cursor} cursor
   */
  keyDelete(cursor) {
    if (cursor.row === null) {
      this.document.markForDeletion();
    } else {
      this.document.entries[cursor.row].markForDeletion();
    }
    return {preventDefault: true};
  }

  /**
   * Turn editor on, if this is opened.
   * @param {Cursor} cursor
   */
  keyEnter(cursor) {
    if (this.open && cursor.row !== null) {
      this.document.entries[cursor.row].turnEditorOn(cursor);
      return {preventDefault: true};
    }
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
