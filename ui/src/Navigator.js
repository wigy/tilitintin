/**
 * A keyboard handler for the application.
 */
class Navigator {

  constructor(store) {
    this.store = store;
  }

  /**
   * Update navigation structures in the store based on the key.
   * @param {String} key
   */
  handle(key) {
    const { component, index } = this.store.selected;
    const fn = 'handle' + component + key;
    if (this[fn]) {
      const update = this[fn](index);
      if (update) {
        console.log(update);
        Object.assign(this.store.selected, update);
        return true;
      }
    }
    // console.log(key);
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
        index = 0;
      } else {
        index += delta;
        if (index < 0) {
          index = N - 1;
        }
        if (index >= N) {
          index = 0;
        }
      }
      return {index};
    }
  }

  // Transaction listing for an account.
  handleAccountTransactionsArrowUp(index) {
    return this.indexUpdate(index, this.store.transactions.length, -1);
  }
  handleAccountTransactionsArrowDown(index) {
    return this.indexUpdate(index, this.store.transactions.length, +1);
  }
}

export default Navigator;
