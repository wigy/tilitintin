import moment from 'moment';

class Navigator {

  // Transaction listing for an account
  // ----------------------------------
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
      // this.cursor.selectIndex('TransactionTable', this.store.filteredTransactions.length - 1);
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
}

export default Navigator;
