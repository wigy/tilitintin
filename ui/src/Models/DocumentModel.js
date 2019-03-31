import React from 'react';
import moment from 'moment';
import { sprintf } from 'sprintf-js';
import { Trans } from 'react-i18next';
import NavigationTargetModel from './NavigationTargetModel';
import EntryModel from '../Models/EntryModel';

// Helper to convert string to date.
const str2date = (str, sample) => {
  sample = sample ? new Date(sample) : new Date();
  // TODO: Localization support.
  if (/^\d{1,2}(\.\d{1,2})?(\.\d{2,4})?\.?$/.test(str)) {
    let [day, month, year] = str.split('.');
    day = parseInt(day);
    month = parseInt(month) || (sample.getMonth() + 1);
    year = parseInt(year) || sample.getFullYear();
    if (year < 100) {
      year += 2000;
    }
    const date = moment(sprintf('%04d-%02d-%02d', year, month, day));
    return date.isValid() ? date.format('YYYY-MM-DD') : undefined;
  }
};

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
    return this.number;
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
   * Use localized date.
   */
  ['get.date']() {
    // TODO: Locale awareness.
    return moment(this.date).format('DD.MM.YYYY');
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
