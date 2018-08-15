/**
 * A keyboard handler for the application.
 */
class Navigator {

  constructor(store) {
    this.store = store;
    this.old = {};
  }

  /**
   * Update navigation structures in the store based on the key.
   * @param {String} key
   */
  handle(key) {
    const {component} = this.store.selected;
    let update;

    let fn = 'handle' + component + key;
    if (this[fn]) {
      update = this[fn](this.store.selected);
    }

    if (!update) {
      fn = 'handle' + key;
      if (this[fn]) {
        update = this[fn](this.store.selected);
      }
    }

    if (update) {
      // console.log(update);
      Object.assign(this.store.selected, update);
      return true;
    }

    // console.log(key);
    return false;
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
    return {index: null};
  }

  // Transaction listing for an account.
  handleTransactionTableArrowUp({index}) {
    return this.indexUpdate(index, this.store.filteredTransactions.length, -1);
  }
  handleTransactionTableArrowDown({index}) {
    return this.indexUpdate(index, this.store.filteredTransactions.length, +1);
  }
  handleTransactionTableArrowLeft() {
    return this.componentUpdate('BalanceTable', this.store.balances.length);
  }
  handleTransactionTableEnter({index}) {
    this.store.filteredTransactions[index].open = !this.store.filteredTransactions[index].open;
  }

  // Account balance listing.
  handleBalanceTableArrowUp({index}) {
    return this.indexUpdate(index, this.store.balances.length, -1);
  }
  handleBalanceTableArrowDown({index}) {
    return this.indexUpdate(index, this.store.balances.length, +1);
  }
  handleBalanceTableArrowRight() {
    return this.componentUpdate('TransactionTable', this.store.filteredTransactions.length);
  }
}

export default Navigator;
