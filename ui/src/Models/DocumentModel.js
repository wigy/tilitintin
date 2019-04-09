import React from 'react';
import { Trans } from 'react-i18next';
import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from '../Models/EntryModel';
import { date2str, str2date } from '../Util';

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
  }

  toJSON() {
    let ret = super.toJSON();
    delete ret.entries;
    return ret;
  }

  getSortKey() {
    return [this.date, this.number, this.id];
  }

  getId() {
    return 'Document' + this.id;
  }

  /**
   * This is editable if period not locked.
   */
  canEdit() {
    return !this.period.locked;
  }

  /**
   * Force keeping document open when making changes in entries.
   */
  async change(field, value) {
    this.store.keepDocumentIdOpen = this.id;
    return super.change(field, value);
  }

  /**
   * Use localized date.
   */
  ['get.date']() {
    return date2str(this.date);
  }
  ['validate.date'](value) {
    const INVALID_DATE = <Trans>Date is incorrect.</Trans>;
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
    return {...data, entries: (data.entries || []).map((e) => new EntryModel(this, e))};
  }

  /**
   * Remove an entry from this document.
   * @param {EntryModel} entry
   */
  deleteEntry(entry) {
    this.entries.replace(this.entries.filter((e) => e.id !== entry.id));
  }

  /**
   * Add an entry to this document.
   * @param {EntryModel} entry
   */
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
