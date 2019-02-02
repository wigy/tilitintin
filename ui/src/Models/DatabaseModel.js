import { observable } from 'mobx';
import Model from './Model';

class DatabaseModel extends Model {

  // All periods of this database.
  @observable
  periodsById = {};

  constructor(parent, init = {}) {
    super(parent, {
      // Name of the database.
      name: null
    }, init);
  }

  getSortKey() {
    return this.name;
  }

  /**
   * Get the account by its ID.
   * @param {Number} id
   * @return {null|AccountModel}
   */
  getAccount(id) {
    return this.store.accountsById[id] || null;
  }

  /**
   * Add new or override old period for the given database.
   * @param {PeriodModel} period
   */
  addPeriod(period) {
    period.parent = this;
    this.periodsById[period.id] = period;
  }

  /**
   * Get the store.
   */
  get store() {
    return this.parent;
  }
}

export default DatabaseModel;
