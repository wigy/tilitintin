class Navigator {

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
}

export default Navigator;
