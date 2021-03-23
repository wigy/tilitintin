import Model from './Model';
import TagModel from './TagModel';
import { makeObservable, observable } from 'mobx';

class AccountModel extends Model {

  static FLAGS = {
    // If set, this is a favorite account.
    FAVORITE: 1
  };

  // Currently unused.
  static VAT_CODES = [
    null,
    null,
    null,
    null,
    'Verollinen myynti',
    'Verolliset ostot',
    'Veroton myynti',
    'Verottomat ostot',
    'Yhteisömyynti',
    'Yhteisöostot',
    'Rakentamispalvelun myynti',
    'Rakentamispalvelun ostot'
  ];

  // Tags found from transactions of this account.
  @observable tagsByTag = {};
  // Period statistics for this account (if loaded).
  @observable periods = [];

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Account number as a string.
      number: null,
      // Name of the account.
      name: null,
      // "ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT"
      type: null,
      // Combined flags.
      flags: 0,
      // VAT percentage used for the account.
      vat_percentage: 0,
      // VAT code (index to the table above).
      vat_code: 0
    }, init);
    makeObservable(this);
  }

  toString() {
    return `${this.number} ${this.name}`;
  }

  getSortKey() {
    return this.number;
  }

  getUrl() {
    return '/' + this.database.name + '/txs/' + this.store.period.id + '/' + this.id;
  }

  getObjectType() {
    return 'Account';
  }

  /**
   * Set tags for this account.
   * @param {String[]} tags
   */
  setTags(tags) {
    this.tagsByTag = {};
    tags.forEach((tagName) => {
      const tag = this.database.getTag(tagName);
      if (!tag) {
        throw new Error(`Cannot find tag '${tagName}' for account ${this.toString()}.`);
      }
      this.tagsByTag[tag.tag] = tag;
    });
  }

  /**
   * Get tag by its code.
   * @param {String} tag
   */
  getTag(tag) {
    return this.tagsByTag[tag] || null;
  }

  /**
   * Set or clear a flag.
   * @param {String} name
   * @param {Boolean} value
   */
  setFlag(name, value) {
    if (value) {
      this.flags = this.flags | AccountModel.FLAGS[name];
    } else {
      this.flags = this.flags & ~AccountModel.FLAGS[name];
    }
  }

  /**
   * Get a value of a flag.
   * @param {String} name
   */
  getFlag(name) {
    return !!(this.flags & AccountModel.FLAGS[name]);
  }

  get store() {
    return this.parent.parent;
  }

  get database() {
    return this.parent;
  }

  get tags() {
    return Object.values(this.tagsByTag).sort(TagModel.sorter());
  }

  get FAVORITE() { return this.getFlag('FAVORITE'); }
  set FAVORITE(value) { this.setFlag('FAVORITE', value); }
}

export default AccountModel;
