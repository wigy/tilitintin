import NavigationTargetModel from './NavigationTargetModel';
import TagModel from './TagModel';

class EntryModel extends NavigationTargetModel {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // The linked account this entry is affecting.
      account_id: null,
      // Positive amount in cents.
      amount: null,
      // If set to 1, this is debit, otherwise credit.
      debit: null,
      // Description text without tags.
      description: null,
      // ID of the document this entry belongs to.
      document_id: null,
      // TODO: What is this?
      flags: 0,
      // Order number for this entry.
      row_number: null,
      // Tag names extracted from the description.
      tagNames: []
    }, init);
  }

  /**
   * Extract tags.
   * @param {Object} data
   */
  initialize(data) {
    const [description, tagNames] = TagModel.desc2tags(data.description);
    return {...data, description, tagNames};
  }

  getSortKey() {
    return this.parent ? [this.parent.number, this.row_number] : this.id;
  }

  columns() {
    return ['account', 'description', 'debit', 'credit'];
  }

  /**
   * Get the document this entry belongs to.
   */
  get document() {
    return this.parent;
  }

  /**
   * Get the period this entry belongs to.
   */
  get period() {
    return this.parent.period;
  }

  /**
   * Get the database this entry belongs to.
   */
  get database() {
    return this.parent.database;
  }

  /**
   * Get the positive (debit) or negative (credit) value of cents.
   */
  get total() {
    return this.debit ? this.amount : -this.amount;
  }

  /**
   * Get the account model this entry is for.
   */
  get account() {
    return this.database.getAccount(this.account_id);
  }

  get tags() {
    return this.tagNames.map((tag) => this.account.getTag(tag)).sort(TagModel.sorter());
  }
}

export default EntryModel;
