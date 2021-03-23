import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from '../Models/EntryModel';
import { date2str, str2date } from '../Util';
import { action, makeObservable } from 'mobx';

class DocumentModel extends NavigationTargetModel {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Document order number.
      number: null,
      // ID of the period this document belongs to.
      period_id: null,
      // Transaction date as a string "YYYY-MM-DD".
      date: null,
      // A list of entries of this document.
      entries: []
    }, init);
    makeObservable(this);
  }

  toJSON() {
    const ret = super.toJSON();
    delete ret.entries;
    return ret;
  }

  getSortKey() {
    return [this.date, this.number, this.id];
  }

  getId() {
    return 'Document' + this.id;
  }

  getObjectType() {
    return 'Document';
  }

  /**
   * This is editable if period not locked.
   */
  canEdit() {
    return !this.period.locked;
  }

  /**
   * Use localized date.
   */
  ['get.date']() {
    return date2str(this.date);
  }

  ['validate.date'](value) {
    const INVALID_DATE = 'Date is incorrect.';
    return str2date(value, this.store.lastDate) ? null : INVALID_DATE;
  }

  ['change.date'](value) {
    this.date = str2date(value, this.store.lastDate);
    this.store.lastDate = this.date;
  }

  /**
   * Instantiate entries.
   * @param {Object} data
   */
  initialize(data) {
    return { ...data, entries: (data.entries || []).map((e) => new EntryModel(this, e)) };
  }

  /**
   * Remove an entry from this document.
   * @param {EntryModel} entry
   */
  deleteEntry(entry) {
    this.entries.replace(this.entries.filter((e) => e.id !== entry.id));
  }

  /**
   * Create an entry based on JSON-data.
   * @param {Object} data
   * Data format is
   * ```
   * {
   *   id: 123, /* For account ID. Alternatively `number` for account number.
   *   amount: 1000,
   *   description: "[Tag1][Tag2] This is text."
   * }
   * ```
   */
  async createEntry(data) {
    if (data.number) {
      data.id = this.database.getAccountByNumber(data.number).id;
    }
    const init = {
      account_id: data.id,
      amount: Math.abs(data.amount),
      debit: data.amount > 0 ? 1 : 0,
      row_number: this.entries.length + 1,
      description: data.description
    };
    if ('flags' in data) {
      init.flags = data.flags;
    }

    const entry = new EntryModel(this, init);
    this.addEntry(entry);
    await entry.save();
    this.period.addEntry(entry);

    return entry;
  }

  /**
   * Add an entry to this document.
   * @param {EntryModel} entry
   */
   @action
   addEntry(entry) {
    entry.document_id = this.id;
    entry.parent = this;
    this.entries.push(entry);
  }

  /**
   * Calculate difference of entry balances.
   */
  imbalance() {
    let debit = 0;
    let credit = 0;
    this.entries.forEach((entry, idx) => {
      if (entry.debit) {
        debit += entry.amount;
      } else {
        credit += entry.amount;
      }
    });
    const smaller = Math.min(debit, credit);
    debit -= smaller;
    credit -= smaller;
    return debit - credit;
  }

  /**
   * Get the period this document belongs to.
   */
  get period() {
    return this.parent;
  }

  /**
   * Get the database this document belongs to.
   */
  get database() {
    return this.parent.database;
  }
}

export default DocumentModel;
