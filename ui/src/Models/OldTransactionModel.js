import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from './EntryModel';

/**
 * Temporary model to arrange entries of the one account as a pairs of its document and the entry itself.
 *
 * TODO: Remove once functionality copied elsewhere.
 */
class TransactionModel extends NavigationTargetModel {

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
}

export default TransactionModel;
