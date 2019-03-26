import Model from './Model';
import TagModel from './TagModel';

class AccountModel extends Model {

  static FLAGS = {
    // If set, this is favorite account.
    FAVORITE: 1
  };

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
      // Tags found from transactions of this account.
      tagsByTag: {}
    }, init);
  }

  toString() {
    return `${this.number} ${this.name}`;
  }

  getSortKey() {
    return this.number;
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

  get store() {
    return this.parent.parent;
  }

  get database() {
    return this.parent;
  }

  get tags() {
    return Object.values(this.tagsByTag).sort(TagModel.sorter());
  }
}

export default AccountModel;
