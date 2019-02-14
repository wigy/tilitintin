import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from './EntryModel';

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
   * Mark either document or entry for deletion.
   * @param {Cursor} cursor
   */
  keyInsert(cursor) {
    if (cursor.row === null) {

    } else {
      this.store.keepDocumentIdOpen = this.document.id;
      const rowNumber = this.document.entries.reduce((prev, cur) => Math.max(prev, cur.row_number), 0) + 1;
      const entry = new EntryModel(this.document, {document_id: this.document.id, row_number: rowNumber});
      this.document.addEntry(entry);
      cursor.setCell(0, this.document.entries.length - 1);
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
   * Turn editor on for entry or document, if this is opened.
   * @param {Cursor} cursor
   */
  keyText(cursor) {
    if (this.open) {
      if (cursor.row === null) {
        this.document.turnEditorOn(cursor);
        return {preventDefault: true};
      } else {
        this.document.entries[cursor.row].turnEditorOn(cursor);
        return {preventDefault: false};
      }
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
