import { observable } from 'mobx';
import Model from './Model';

class DatabaseModel extends Model {

  // All periods of this database.
  @observable
  periodsById = {};
  // All accounts of this database.
  @observable
  accountsById = {};
  // All tags of this database.
  @observable
  tagsByTag = {};

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
   * Add new or override old period for the given database.
   * @param {PeriodModel} period
   */
  addPeriod(period) {
    period.parent = this;
    this.periodsById[period.id] = period;
  }

  /**
   * Add new or override old account for the given database.
   * @param {AccountModel} account
   */
  addAccount(account) {
    account.parent = this;
    this.accountsById[account.id] = account;
  }

  /**
   * Add new or override old tag for the given database.
   * @param {AccountModel} account
   */
  addTag(tag) {
    tag.parent = this;
    this.tagsByTag[tag.tag] = tag;
  }

  /**
   * Get the tag by its code.
   * @param {String} tag
   */
  getTag(tag) {
    return this.tagsByTag[tag] || null;
  }

  /**
   * Get the account by its ID.
   * @param {Number} id
   * @return {null|AccountModel}
   */
  getAccount(id) {
    return this.accountsById[id] || null;
  }

  /**
   * Check if this database has accounts loaded.
   * @return {Boolean}
   */
  hasAccounts() {
    return Object.keys(this.accountsById).length > 0;
  }

  /**
   * Get the store.
   */
  get store() {
    return this.parent;
  }
}

export default DatabaseModel;
