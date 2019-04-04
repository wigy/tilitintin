import { observable } from 'mobx';
import Model from './Model';
import PeriodModel from './PeriodModel';
import DocumentModel from './DocumentModel';
import EntryModel from './EntryModel';

class DatabaseModel extends Model {

  // All periods of this database.
  @observable
  periodsById = {};
  // All accounts of this database.
  @observable
  accountsById = {};
  @observable
  accountsByNumber = {};
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
    this.accountsByNumber[account.number] = account;
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
   * Look from the account list the account collecting profit.
   */
  getProfitAccount() {
    for (const account of Object.values(this.accountsById)) {
      if (account.type === 'PROFIT_PREV') {
        return account;
      }
    }
  }

  /**
   * Create new period with initial balances taken from the latest period.
   */
  async createNewPeriod(startDate, endDate, initText) {
    if (!this.periods.length) {
      throw new Error('Creating a period for empty database not yet supported.');
    }
    const profitAcc = this.getProfitAccount();
    if (!profitAcc) {
      throw new Error('Cannot find previous profit account.');
    }
    const lastPeriod = this.periods[this.periods.length - 1];

    // Collect the balances from the previous period.
    await this.store.fetchBalances(this.name, lastPeriod.id);
    let profit = 0;
    let balances = [];
    Object.values(lastPeriod.balances).forEach((balance) => {
      const acc = this.accountsById[balance.account_id];
      switch (acc.type) {
        case 'ASSET':
        case 'LIABILITY':
        case 'EQUITY':
          if (balance.total) {
            balances.push({id: acc.id, number: acc.number, balance: balance.total});
          }
          break;
        case 'REVENUE':
        case 'EXPENSE':
        case 'PROFIT_PREV':
          profit += balance.total;
          break;
        default:
          throw new Error(`No idea how to handle ${acc.type} account, when creating new period.`);
      }
    });

    // Create period.
    const period = new PeriodModel(this, {start_date: startDate, end_date: endDate});
    this.addPeriod(period);
    await period.save();

    // Create document.
    const doc = new DocumentModel(period, {number: 0, date: startDate});
    period.addDocument(doc);
    await doc.save();

    // Prepare profit entry.
    if (profit) {
      balances.push({id: profitAcc.id, number: profitAcc.number, balance: profit});
    }

    // Create entries.
    // TODO: Use Store API.
    balances.sort((a, b) => (a.number > b.number ? 1 : (a.number < b.number ? -1 : 0)));
    for (const balance of balances) {
      const entry = new EntryModel(doc, {
        account_id: balance.id,
        amount: Math.abs(balance.balance),
        debit: balance.balance > 0 ? 1 : 0,
        row_number: doc.entries.length + 1,
        description: initText
      });
      doc.addEntry(entry);
      await entry.save();
    }
  }

  /**
   * Check if the given tag is defined.
   * @param {String} tag
   * @return {Boolean}
   */
  hasTag(tag) {
    return !!this.tagsByTag[tag];
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
   * Get the account by its number.
   * @param {Number} number
   * @return {null|AccountModel}
   */
  getAccountByNumber(number) {
    return this.accountsByNumber[number] || null;
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
