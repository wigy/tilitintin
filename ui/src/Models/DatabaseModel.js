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
  // All headings of this database.
  @observable
  headingsByNumber = {};

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
   * Add new or override old period for this database.
   * @param {PeriodModel} period
   */
  addPeriod(period) {
    period.parent = this;
    this.periodsById[period.id] = period;
  }

  /**
   * Get the period by its ID.
   * @param {Number} id
   * @return {null|PeriodModel}
   */
  getPeriod(id) {
    return this.periodsById[id] || null;
  }

  /**
   * Add new or override old account for this database.
   * @param {AccountModel} account
   */
  addAccount(account) {
    account.parent = this;
    this.accountsById[account.id] = account;
  }

  /**
   * Add new or override old tag for this database.
   * @param {AccountModel} account
   */
  addTag(tag) {
    tag.parent = this;
    this.tagsByTag[tag.tag] = tag;
  }

  /**
   * Add new or override old heading for this database.
   * @param {HeadingModel} heading
   */
  addHeading(heading) {
    heading.parent = this;
    this.headingsByNumber[heading.number] = this.headingsByNumber[heading.number] || [];
    this.headingsByNumber[heading.number].push(heading);
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

  /**
   * Get periods of this database.
   */
  get periods() {
    return Object.values(this.periodsById);
  }

  /**
   * Get the headings data.
   */
  get headings() {
    return this.headingsByNumber;
  }
}

export default DatabaseModel;
