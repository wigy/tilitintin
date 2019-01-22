import { action } from 'mobx';
import moment from 'moment';

const KEY_DEBUG = false;

/**
 * A keyboard navigation handler for the application.
 */
class Navigator {

  constructor(cursor, store) {
    this.cursor = cursor;
    this.store = store;
  }

  /**
   * Update navigation structures in the store based on the key.
   * @param {String} key
   * @return {Object}
   */
  @action.bound
  handle(key) {
    const {component} = this.cursor;
    if (component === null) {
      return null;
    }

    let update;
    const keyName = (key.length === 1 ? 'Text' : key);

    // Handle keys for modal.
    if (this.cursor.activeModal) {
      switch (keyName) {
        case 'Escape':
          this.cursor.activeModal.onCancel();
          return null;
        case 'Enter':
          this.cursor.activeModal.onConfirm();
          return null;
        default:
          return null;
      }
    }

    // Try component specific handler.
    let fn = 'handle' + component + keyName;
    if (this[fn]) {
      update = this[fn](this.cursor, key);
      if (update && KEY_DEBUG) {
        console.log(fn, ':', update);
      }
    }

    // Try generic handler.
    if (!update) {
      fn = 'handle' + keyName;
      if (this[fn]) {
        update = this[fn](this.cursor, key);
        if (update && KEY_DEBUG) {
          console.log(fn, ':', update);
        }
      }
    }

    if (update) {
      let ret = {preventDefault: true};
      if (update.dontPreventDefault) {
        delete update.dontPreventDefault;
        ret.preventDefault = false;
      }

      Object.assign(this.cursor, update);

      if (KEY_DEBUG) {
        const {component, index, column, row, editor} = this.cursor;
        console.log('=>', {component, index, column, row, editor});
      }

      return ret;
    }

    if (KEY_DEBUG) {
      console.log(`No handler for key '${key}'.`);
    }

    return null;
  }

  // Generic.
  handleEscape() {
    this.cursor.save();
    return {index: null, column: null, row: null};
  }

  // TODO: How to move these inside appropriate component in easy and readable manner?
  // TODO: Add support for page up and page down.

  // Transaction listing for an account
  // ----------------------------------
  handleTransactionTableArrowUp({index, column, row}) {
    if (index !== null && row !== null && this.store.filteredTransactions[index].open) {
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, -1);
      return ret;
    }
    const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, -1);
    if (ret) {
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleTransactionTableArrowDown({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      if (row === this.store.filteredTransactions[index].entries.length - 1) {
        const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, +1);
        ret.column = null;
        ret.row = null;
        return ret;
      }
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, +1, 1);
      return ret;
    }
    const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, +1);
    if (ret) {
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleTransactionTableArrowLeft({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, -1, 0);
      return ret;
    }
    return this.cursor.componentUpdate('BalanceTable', this.store.balances.length);
  }
  handleTransactionTableArrowRight({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, +1, 0);
      return ret;
    }
  }
  handleTransactionTableEnter({index, row}) {
    if (index !== null && row === null) {
      this.store.filteredTransactions[index].open = !this.store.filteredTransactions[index].open;
    }
    if (index !== null && row !== null) {
      return {editor: true};
    }
    return {row: null, column: null};
  }
  handleTransactionTableTab({index, column, row}) {
    if (index !== null && row !== null) {
      column++;
      if (column >= 4) {
        column = 0;
        if (row >= this.store.filteredTransactions[index].entries.length - 1) {
          this.handleTransactionTableInsert({index, row});
        }
        row++;
      }
      return {column, row};
    }
  }
  handleTransactionTableEscape({index}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      this.store.filteredTransactions[index].open = false;
      return {index, row: null, column: null};
    }
    return this.handleEscape();
  }
  handleTransactionTableInsert({index, row}) {
    if (row === null) {
      const account = this.store.account;
      const entry = {
        id: null,

        document_id: null,
        debit: 1,
        amount: '',
        row_number: 1,
        flags: 0, // TODO: What is this?

        description: '',
        tags: [],

        account_id: account.id,
        number: account.number,
        name: account.name
      };
      const tx = {
        id: null,

        document_id: null,
        debit: 1,
        amount: 0,
        row_number: 1,
        flags: 0, // TODO: What is this?

        description: '',
        date: moment().format('YYYY-MM-DD'), // TODO: Store the latest date added and use it.
        tags: [],
        entries: [entry],
        account_id: account.id,
        number: null,
        open: true

      };
      this.store.transactions.push(tx);
      this.cursor.selectIndex('TransactionTable', this.store.transactions.length - 1);
      this.cursor.selectEditing();
    } else {
      const sample = this.store.transactions[index].entries[row];
      const entry = {
        id: null,

        document_id: sample.document_id,
        debit: 1,
        amount: 0,
        row_number: this.store.transactions[index].entries.reduce((prev, cur) => Math.max(prev, cur.row_number), 0) + 1,
        flags: 0, // TODO: What is this?

        description: sample.description,
        tags: [],

        account_id: 0,
        number: '',
        name: null
      };

      this.store.transactions[index].entries.push(entry);
      this.cursor.selectCell(0, this.store.transactions[index].entries.length - 1);
      this.cursor.selectEditing();
    }
  }
  handleTransactionTableDelete({index, row}) {
    if (row !== null) {
      this.store.transactions[index].entries[row].askDelete = true;
    } else if (index !== null) {
      this.store.transactions[index].askDelete = true;
    }
  }
  handleTransactionTableText({index, row, editor}, key) {
    // Date cell.
    if (index !== null && row === null) {
      return {editor: true};
    }
    // Other cells.
    if (index !== null && row !== null) {
      return {editor: true, dontPreventDefault: true};
    }
  }

  // Account balance listing
  // -----------------------
  handleBalanceTableArrowUp({index}) {
    const ret = this.cursor.indexUpdate(index, this.store.balances.length, -1);
    // TODO: Would be nice to get rid of direct DOM-manipulation.
    if (ret) {
      const el = document.getElementById('Balance' + this.store.balances[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleBalanceTableArrowDown({index}) {
    const ret = this.cursor.indexUpdate(index, this.store.balances.length, +1);
    if (ret) {
      const el = document.getElementById('Balance' + this.store.balances[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleBalanceTableArrowRight() {
    return this.cursor.componentUpdate('TransactionTable', this.store.filteredTransactions.length);
  }
  handleBalanceTableEnter({index}) {
    if (this.store.balances[index]) {
      const el = document.getElementById('Balance' + this.store.balances[index].id);
      el.children[0].children[0].click();
      return {};
    }
  }
}

export default Navigator;
