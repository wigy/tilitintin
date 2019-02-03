import NavigationTargetModel from './NavigationTargetModel';

class BalanceModel extends NavigationTargetModel {

  constructor(parent, init = {}) {
    super(parent, {
      // The linked account this entry is affecting.
      account_id: null,
      // Sum of debits in cents.
      debit: null,
      // Sum of credits in cents.
      credit: null,
      // Balance amount in cents.
      total: null
    }, init);
  }

  getSortKey() {
    return this.account && this.account.number;
  }

  getId() {
    return 'Balance' + this.account_id;
  }

  getUrl() {
    return '/' + this.database.name + '/txs/' + this.period.id + '/' + this.account_id;
  }

  /**
   * Get the period of this balance.
   */
  get period() {
    return this.parent;
  }

  /**
   * Get the database of this balance.
   */
  get database() {
    return this.parent.database;
  }

  /**
   * Get the account this balance applies.
   */
  get account() {
    return this.period.getAccount(this.account_id);
  }
}

export default BalanceModel;
