const KEY_DEBUG = false;

/**
 * A keyboard handler for the application.
 *
 * The store has `selected` component containing
 *   page - current page
 *   component - current component
 *   index - index number of the item inside the component
 *   column - column index if in matrix area or null
 *   row - row index if in matrix area or null
 *   editor - if set, editing is in progress
 */
class Navigator {

  constructor(store) {
    this.store = store;
    this.old = {};
  }

  /**
   * Update navigation structures in the store based on the key.
   * @param {String} key
   * @return {Object}
   */
  handle(key) {
    const {component} = this.store.selected;
    if (component === null) {
      return null;
    }

    let update;
    const keyName = (key.length === 1 ? 'Text' : key);
    let fn = 'handle' + component + keyName;

    if (this[fn]) {
      update = this[fn](this.store.selected, key);
      if (update && KEY_DEBUG) {
        console.log(fn, ':', update);
      }
    }

    if (!update) {
      fn = 'handle' + keyName;
      if (this[fn]) {
        update = this[fn](this.store.selected, key);
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

      Object.assign(this.store.selected, update);

      if (KEY_DEBUG) {
        const {component, index, column, row, editor} = this.store.selected;
        console.log('=>', {component, index, column, row, editor});
      }

      return ret;
    }

    if (KEY_DEBUG) {
      console.log(`No hanler for key '${key}'.`);
    }

    return null;
  }

  /**
   * Helper to wrap index counter around boundaries.
   * @param {Number} index
   * @param {Number} N
   * @param {Number} delta
   */
  indexUpdate(index, N, delta) {
    if (N) {
      if (index === null) {
        index = this.old[this.store.selected.component];
        if (index === undefined || index === null) {
          index = delta < 0 ? N - 1 : 0;
        }
      } else {
        index += delta;
        if (index < 0) {
          index = N - 1;
        }
        else if (index >= N) {
          index = 0;
        }
      }
      return {index};
    }
  }

  /**
   * Helper to navigate inside rectangular area.
   * @param {Number} column
   * @param {Number} row
   * @param {Number} N
   * @param {Number} M
   * @param {Number} dx
   * @param {Number} dy
   */
  boxUpdate(column, row, N, M, dx, dy, entryColumn = 0) {
    if (N && M) {
      column = (column + N + dx) % N;
      if (row === null) {
        row = 0;
        column = entryColumn;
      } else {
        row += dy;
        if (row < 0) {
          row = null;
          column = null;
        }
        if (row >= M) {
          row = M - 1;
        }
      }
      return {column, row}
    }
  }

  /**
   * Construct component update.
   * @param {String} component
   */
  componentUpdate(component, N) {
    this.save();
    let index = this.old[component] || 0;
    if (!N) {
      index = null;
    }
    else if (index >= N) {
      index = N - 1;
    }
    return {component, index};
  }

  /**
   * Save the current position.
   */
  save() {
    if (this.store.selected.index !== null) {
      this.old[this.store.selected.component] = this.store.selected.index;
    }
  }

  // Generic.
  handleEscape() {
    this.save();
    return {index: null, column: null, row: null};
  }


  // Transaction listing for an account
  // ----------------------------------
  handleTransactionTableArrowUp({index, column, row}) {
    if (index !== null && row !== null && this.store.filteredTransactions[index].open) {
      const ret = this.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, -1);
      return ret;
    }
    const ret = this.indexUpdate(index, this.store.filteredTransactions.length, -1);
    const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
    el.scrollIntoView({block: "center", inline: "center"})
    return ret;
  }
  handleTransactionTableArrowDown({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, 0, +1, 1);
      return ret;
    }
    const ret = this.indexUpdate(index, this.store.filteredTransactions.length, +1);
    const el = document.getElementById('Transaction' + this.store.filteredTransactions[ret.index].id);
    el.scrollIntoView({block: "center", inline: "center"})
    return ret;
  }
  handleTransactionTableArrowLeft({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, -1, 0);
      return ret;
    }
    return this.componentUpdate('BalanceTable', this.store.balances.length);
  }
  handleTransactionTableArrowRight({index, column, row}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      const ret = this.boxUpdate(column, row, 4, this.store.filteredTransactions[index].entries.length, +1, 0);
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
  handleTransactionTableEscape({index}) {
    if (index !== null && this.store.filteredTransactions[index].open) {
      this.store.filteredTransactions[index].open = false;
      return {index, row: null, column: null};
    }
    return this.handleEscape();
  }
  handleTransactionTableText({index, row, editor}, key) {
    if (index !== null && row !== null) {
      return {editor: true, dontPreventDefault: true};
    }
  }

  // Account balance listing
  // -----------------------
  handleBalanceTableArrowUp({index}) {
    const ret = this.indexUpdate(index, this.store.balances.length, -1);
    // TODO: Would be nice to get rid of direct DOM-manipulation.
    const el = document.getElementById('Balance' + this.store.balances[ret.index].id);
    el.scrollIntoView({block: "center", inline: "center"})
    return ret;
  }
  handleBalanceTableArrowDown({index}) {
    const ret = this.indexUpdate(index, this.store.balances.length, +1);
    const el = document.getElementById('Balance' + this.store.balances[ret.index].id);
    el.scrollIntoView({block: "center", inline: "center"})
    return ret;
  }
  handleBalanceTableArrowRight() {
    return this.componentUpdate('TransactionTable', this.store.filteredTransactions.length);
  }
  handleBalanceTableEnter({index}) {
    const el = document.getElementById('Balance' + this.store.balances[index].id);
    el.children[0].children[0].click();
    return {};
  }
}

export default Navigator;
