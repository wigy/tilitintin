import moment from 'moment';

class Navigator {

  // TODO: Refactor all these functions and move to Cursor.
  // ------------------------------------------------------

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
  handleTransactionTableArrowLeft({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.cursor.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, -1, 0);
      return ret;
    }
    // return this.cursor.componentUpdate('BalanceTable', this.store.balances.length);
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
      // this.cursor.selectCell(0, this.store.transactions[index].entries.length - 1);
      this.cursor.selectEditing();
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
