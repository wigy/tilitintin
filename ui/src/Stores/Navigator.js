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
   * Update navigation structures in the store based on the key pressed.
   * @param {String} key
   * @return {Object}
   */
  @action.bound
  handle(key) {
    let result;
    const keyName = (key.length === 1 ? 'Text' : key);
    const fn = 'key' + keyName.replace(/\+/g, '');

    // Try component handler.
    const component = this.cursor.getComponent();
    if (component && component[fn]) {
      result = component[fn]();
    }

    // Try cursor handler.
    if (!result && this.cursor[fn]) {
      result = this.cursor[fn]();
      if (result && KEY_DEBUG) {
        console.log(fn, ':', result);
      }
    }

    // Try generic handler.
    if (!result && this[fn]) {
      result = this[fn]();
      if (result && KEY_DEBUG) {
        console.log(fn, ':', result);
      }
    }

    if (result) {
      return result;
    }

    if (KEY_DEBUG) {
      console.log(`No handler for key '${key}'.`);
    }

    return null;
  }

  /**
   * Set up the topology for the page.
   * @param {String} name
   */
  @action.bound
  selectPage(page) {
    switch (page) {
      case 'Balances':
        this.cursor.setTopology(page, () => [
          [
            {name: 'balances', data: this.store.balances},
            {name: 'transactions', data: this.store.filteredTransactions.map((tx) => tx.document)}
          ]
        ]);
        break;
      default:
        this.cursor.setTopology(page, () => [[]]);
        console.error(`No topology defined for page ${page}.`);
    }
  }

  /**
   * Disable focus change using tab-key.
   */
  keyTab() {
    return {preventDefault: true};
  }
  keyShiftTab() {
    return {preventDefault: true};
  }

  // TODO: Refactor all these functions.
  // ------------------------------------------------------------------------------------
  @action.bound
  oldHandle(key) {
    const {component} = this.cursor;
    if (component === null) {
      return null;
    }

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
  handleTransactionTableArrowUp({index, column, row}, amount = -1) {
    if (index !== null && row !== null && this.store.filteredTransactions[index].open) {
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, amount);
      return ret;
    }
    const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, amount);
    if (ret) {
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleTransactionTablePageUp({index, column, row}) {
    return this.handleTransactionTableArrowUp({index, column, row}, -10);
  }
  handleTransactionTableArrowDown({index, column, row}, amount = +1) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      if (row === this.store.filteredTransactions[index].entries.length - 1) {
        const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, amount);
        ret.column = null;
        ret.row = null;
        return ret;
      }
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, amount, 1);
      return ret;
    }
    const ret = this.cursor.indexUpdate(index, this.store.filteredTransactions.length, amount);
    if (ret) {
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
    return ret;
  }
  handleTransactionTablePageDown({index, column, row}) {
    return this.handleTransactionTableArrowDown({index, column, row}, 10);
  }
  handleTransactionTableHome() {
    if (this.store.filteredTransactions.length) {
      // TODO: DRY
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[0].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
      return {index: 0};
    }
  }
  handleTransactionTableEnd() {
    const N = this.store.filteredTransactions.length;
    if (N) {
      // TODO: DRY
      const el = document.getElementById('Transaction' + this.store.filteredTransactions[N - 1].id);
      el.scrollIntoView({block: 'center', inline: 'center'});
      return {index: N - 1};
    }
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
      this.store.filteredTransactions[index].document.open = !this.store.filteredTransactions[index].document.open;
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
        date: this.store.lastDate || moment().format('YYYY-MM-DD'),
        tags: [],
        entries: [entry],
        account_id: account.id,
        number: null,
        open: true

      };
      this.store.transactions.push(tx);
      this.cursor.selectIndex('TransactionTable', this.store.filteredTransactions.length - 1);
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
  handleTransactionTableText({index, row, editor}) {
    // Date cell.
    if (index !== null && row === null) {
      return {editor: true};
    }
    // Other cells.
    if (index !== null && row !== null) {
      return {editor: true, dontPreventDefault: true};
    }
  }
}

export default Navigator;
