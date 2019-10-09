import NavigationTargetModel from './NavigationTargetModel';

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
}

export default TransactionModel;
