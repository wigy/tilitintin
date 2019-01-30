import Model from './Model';

class AccountModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Account number as a string.
      number: null,
      // Name of the account.
      name: null,
      // "ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT"
      type: null,
      // Tags found from transactions of this account.
      tags: []
    }, init);
  }

  toString() {
    return `${this.number} ${this.name}`;
  }

  getSortKey() {
    return this.number;
  }

  /**
   * Add tags for this account.
   * @param {String[]} tags
   */
  addTags(tags) {
    tags.forEach((tag) => {
      if (this.tags.indexOf(tag) < 0) {
        this.tags.push(tag);
      }
    });
  }
}

export default AccountModel;
