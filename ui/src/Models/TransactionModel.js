import { runInAction } from 'mobx';
import moment from 'moment';
import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from './EntryModel';
import DocumentModel from './DocumentModel';

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
   * Mark either document or entry for deletion.
   * @param {Cursor} cursor
   */
  keyInsert(cursor) {
    if (cursor.row === null) {
      const document = new DocumentModel(this.document, {
        period_id: this.period.id,
        date: this.store.lastDate || moment().format('YYYY-MM-DD')
      });
      document.save()
        .then(() => {
          runInAction(() => {
            const oldId = this.store.accountId;
            const entry = new EntryModel(document, {document_id: document.id, row_number: 1, account_id: this.store.accountId});
            document.addEntry(entry);
            this.store.keepDocumentIdOpen = document.id;
            // TODO: Why this does not trigger computed property `transactions` recalculation without forcing it by modifying accountId?
            this.period.addDocument(document);
            this.store.accountId = null;
            this.store.accountId = oldId;
            cursor.setIndex(this.store.filteredTransactions.length - 1);
          });
        });
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
