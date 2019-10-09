import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from './EntryModel';

/**
 * Temporary model to arrange entries of the one account as a pairs of its document and the entry itself.
 *
 * TODO: Remove once functionality copied elsewhere.
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

  /**
   * Mark either document or entry for deletion.
   * @param {Cursor} cursor
   */
  keyDelete(cursor) {
    if (cursor.row === null) {
      if (!this.document.canEdit()) {
        return;
      }
      this.document.markForDeletion();
    } else {
      if (!this.document.entries[cursor.row].canEdit()) {
        return;
      }
      this.document.entries[cursor.row].markForDeletion();
    }
    return {preventDefault: true};
  }

  /**
   * Walk through columns and rows and add an entry, if on the last column of the last row.
   * @param {Cursor} cursor
   */
  keyTab(cursor) {
    if (cursor.row === null) {
      cursor.setCell(0, 0);
      // Since we enter on second column when coming from null-row, redo it.
      return cursor.setCell(0, 0);
    } else {
      const model = cursor.getModel();
      const [columns, rows] = model.geometry();
      if (cursor.column < columns - 1) {
        return cursor.setCell(cursor.column + 1, cursor.row);
      } else if (cursor.row < rows - 1) {
        return cursor.setCell(0, cursor.row + 1);
      } else {
        this.keyInsert(cursor);
      }
    }
  }

  /**
   * Walk through columns and rows in reverse order.
   * @param {Cursor} cursor
   */
  keyShiftTab(cursor) {
    if (cursor.row !== null) {
      const model = cursor.getModel();
      const [columns] = model.geometry();
      if (cursor.column > 0) {
        return cursor.setCell(cursor.column - 1, cursor.row);
      } else if (cursor.row > 0) {
        return cursor.setCell(columns - 1, cursor.row - 1);
      } else {
        return cursor.setCell(null, null);
      }
    }
  }

  /**
   * Insert either a document or an entry.
   * @param {Cursor} cursor
   */
  keyInsert(cursor) {
    if (this.period.locked) {
      return;
    }
    // TODO: Combine with keyInsert() in TransactionTable.
    if (cursor.row !== null) {
      this.store.keepDocumentIdOpen = this.document.id;
      const rowNumber = this.document.entries.reduce((prev, cur) => Math.max(prev, cur.row_number), 0) + 1;
      const description = this.document.entries.length ? this.document.entries[this.document.entries.length - 1].text : '';
      const entry = new EntryModel(this.document, {document_id: this.document.id, row_number: rowNumber, description});
      this.document.addEntry(entry);
      cursor.setCell(0, this.document.entries.length - 1);
      return {preventDefault: true};
    }
  }

  /**
   * Turn editor on, if this is opened.
   * @param {Cursor} cursor
   */
  keyEnter(cursor) {
    if (this.open && cursor.row !== null) {
      this.turnEditorOn(cursor);
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
        return {preventDefault: false};
      } else {
        this.turnEditorOn(cursor);
        return {preventDefault: false};
      }
    }
  }

  turnEditorOn(cursor) {
    if (cursor.row !== null && cursor.row < this.document.entries.length) {
      this.document.entries[cursor.row].turnEditorOn(cursor);
    }
  }

  turnEditorOff(cursor) {
    if (cursor.row !== null && cursor.row < this.document.entries.length) {
      this.document.entries[cursor.row].turnEditorOff(cursor);
    }
  }
}

export default TransactionModel;
