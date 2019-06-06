import React from 'react';
import { Link } from 'react-router-dom';
import { sprintf } from 'sprintf-js';
import { Trans } from 'react-i18next';
import NavigationTargetModel from './NavigationTargetModel';
import TagModel from './TagModel';
import Money from '../Components/Money';
import { str2num } from '../Util';

class EntryModel extends NavigationTargetModel {

  static FLAGS = {
    // If set, this entry is summary for VAT.
    VAT_IGNORE: 1,
    // If set, this entry has been collected for VAT.
    VAT_RECONCILED: 2
  };

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // The linked account this entry is affecting.
      account_id: null,
      // Positive amount in cents.
      amount: 0,
      // If set to 1, this is debit, otherwise credit.
      debit: 1,
      // Description text without tags.
      description: '',
      // ID of the document this entry belongs to.
      document_id: null,
      // Combined flags.
      flags: 0,
      // Order number for this entry.
      row_number: null,
      // Tag names extracted from the description.
      tagNames: []
    }, init);
  }

  /**
   * Combine tags to description.
   */
  toJSON() {
    let ret = super.toJSON();
    if (ret.tagNames.length) {
      ret.description = '[' + ret.tagNames.join('][') + '] ' + ret.description;
    }
    delete ret.tagNames;
    return ret;
  }

  /**
   * Extract tags.
   * @param {Object} data
   */
  initialize(data) {
    const [description, tagNames] = TagModel.desc2tags(data.description || '');
    return {...data, description, tagNames};
  }

  getSortKey() {
    return this.parent ? [this.parent.date, this.parent.number, this.row_number] : this.id;
  }

  columns() {
    return ['account', 'description', 'debit', 'credit'];
  }

  /**
   * Check if the cell is currently selected.
   * @param {Number} column
   * @param {Number} row
   */
  isSubSelected(column, row) {
    if (
      row !== null &&
      this.document.entries.indexOf(this) === row &&
      column !== null &&
      this.columns()[column] === this.column
    ) {
      const txs = this.store.filteredTransactions.filter(tx => tx.selected);
      return (txs.length && txs[0].document === this.document);
    }
    return false;
  }

  /**
   * Calculate if the account is `current`, `error` situation and if `sub-selected` should be on.
   * @param {Number|null} column
   * @param {Number|null} row
   */
  getClasses(column = null, row = null) {
    return super.getClasses(column, row) +
      (this.store.accountId === this.account_id ? ' current' : '') +
      (this.isSubSelected(column, row) ? ' sub-selected' : '') +
      (this.account_id === 0 ? ' error' : '');
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
    this.store.keepDocumentIdOpen = this.document.id;
    return super.change(field, value);
  }

  /**
   * Split a string starting with tags to list of tags and the rest of the string.
   * @param {String} value
   * @return [String[], String|null]
   * If tags are not valid, the reminder part is null.
   */
  extractTags(value) {
    let tags = [];
    value = value.trim();
    const regex = /^(\[(\w+?)\])+/.exec(value);
    if (regex) {
      tags = regex[0].substr(1, regex[0].length - 2).split('][');
      for (const tagName of tags) {
        if (!this.database.hasTag(tagName)) {
          return [[], null];
        }
      }
      value = value.substr(regex[0].length).trim();
    }
    return [tags, value];
  }

  /**
   * Description is required field, which includes also tags during the edit.
   * @param {String} value
   */
  ['validate.description'](value) {
    const REQUIRED = <Trans>This field is required.</Trans>;
    const INVALID_TAG = <Trans>Undefined tag.</Trans>;

    const [, newValue] = this.extractTags(value);
    if (newValue === null) {
      return INVALID_TAG;
    }
    return value ? null : REQUIRED;
  }
  ['get.edit.description']() {
    const tags = this.tagNames.length ? '[' + this.tagNames.map(t => t).join('][') + '] ' : '';
    return tags + this.description;
  }
  ['get.description']() {
    const tags = this.tagNames.length ? '[' + this.tagNames.map(t => t).join('][') + '] ' : '';
    return tags + this.description;
  }
  ['change.description'](value) {
    const [tags, newValue] = this.extractTags(value);
    this.description = newValue;
    this.tagNames.replace(tags);
    this.period.refreshTags();
  }
  async ['proposal.description'](value) {
    const texts = await this.store.fetchEntryDescriptions(this.database.name, this.account_id);
    value = value.toLowerCase();
    return texts.filter(t => value === '' || t.toLowerCase().indexOf(value) >= 0).sort();
  }

  /**
   * Format as money, if this is debit entry.
   */
  ['get.debit']() {
    return this.debit && this.amount !== '' ? (<Money cents={this.amount} currency="EUR" />) : <span className="filler">-</span>;
  }
  ['get.edit.debit']() {
    return this.debit ? sprintf('%.2f', this.amount / 100) : '';
  }
  ['validate.debit'](value) {
    const INVALID_NUMBER = <Trans>Numeric value incorrect.</Trans>;
    const NO_NEGATIVE = <Trans>Cannot be negative.</Trans>;

    if (value === '') {
      return null;
    }
    const num = str2num(value);
    if (isNaN(num)) {
      return INVALID_NUMBER;
    }
    if (num < 0) {
      return NO_NEGATIVE;
    }
    return null;
  }
  ['change.debit'](value) {
    if (value !== '') {
      this.debit = 1;
      this.amount = Math.round(str2num(value) * 100);
    }
  }
  ['proposal.debit'](value) {
    const amounts = new Set();
    let imbalance = [];
    // Add always imbalance as proposal.
    let miss = this.document.imbalance() + (this.debit ? -this.amount : this.amount);
    if (miss < 0) {
      imbalance.push(sprintf('%.2f', -miss / 100));
    }
    // Add old values that match.
    value = value.trim();
    this.store.transactions.forEach((tx) => {
      for (let i = 0; i < tx.document.entries.length; i++) {
        if (tx.document.entries[i].account_id === this.account_id && tx.document.entries[i].debit) {
          if (value !== '') {
            const [base, decimals] = sprintf('%.2f', tx.document.entries[i].amount / 100).split('.');
            const [valueBase, valueDecimals] = value.split(/[^0-9]/);
            if (!base.startsWith(valueBase)) {
              continue;
            }
            if (valueDecimals !== undefined && !decimals.startsWith(valueDecimals)) {
              continue;
            }
          }
          amounts.add(tx.document.entries[i].amount);
        }
      }
    });
    // Sort and combine.
    amounts.delete(-miss);
    const others = [...amounts].sort((a, b) => a - b).map((a) => sprintf('%.2f', a / 100));
    return imbalance.concat(others);
  }

  /**
   * Format as money, if this is credit entry.
   */
  ['get.credit']() {
    return !this.debit && this.amount !== '' ? (<Money cents={this.amount} currency="EUR" />) : <span className="filler">-</span>;
  }
  ['get.edit.credit']() {
    return !this.debit ? sprintf('%.2f', this.amount / 100) : '';
  }
  ['validate.credit'](value) {
    return this['validate.debit'](value);
  }
  ['change.credit'](value) {
    if (value !== '') {
      this.debit = 0;
      this.amount = Math.round(str2num(value) * 100);
    }
  }
  ['proposal.credit'](value) {
    const amounts = new Set();
    let imbalance = [];
    // Add always imbalance as proposal.
    let miss = this.document.imbalance() + (this.debit ? -this.amount : this.amount);
    if (miss > 0) {
      imbalance.push(sprintf('%.2f', miss / 100));
    }
    // Add old values that match.
    value = value.trim();
    this.store.transactions.forEach((tx) => {
      for (let i = 0; i < tx.document.entries.length; i++) {
        if (tx.document.entries[i].account_id === this.account_id && !tx.document.entries[i].debit) {
          if (value !== '') {
            const [base, decimals] = sprintf('%.2f', tx.document.entries[i].amount / 100).split('.');
            const [valueBase, valueDecimals] = value.split(/[^0-9]/);
            if (!base.startsWith(valueBase)) {
              continue;
            }
            if (valueDecimals !== undefined && !decimals.startsWith(valueDecimals)) {
              continue;
            }
          }
          amounts.add(tx.document.entries[i].amount);
        }
      }
    });
    // Sort and combine.
    amounts.delete(miss);
    const others = [...amounts].sort((a, b) => a - b).map((a) => sprintf('%.2f', a / 100));
    return imbalance.concat(others);
  }

  /**
   * Render link to the transaction listing of the account. For editing, use account number.
   */
  ['get.account']() {
    if (!this.account_id) {
      return '';
    }
    let url = '/' + this.database.name + '/txs/' + this.period.id + '/' + this.account_id;
    return <Link to={url}>{this.account.toString()}</Link>;
  }
  ['get.edit.account']() {
    return this.account_id ? this.account.number : '';
  }
  ['validate.account'](value) {
    const INVALID_ACCOUNT = <Trans>No such account found.</Trans>;
    return this.store.accounts.filter(a => a.number === value || a.name === value || `${a.number} ${a.name}` === value).length ? null : INVALID_ACCOUNT;
  }
  ['change.account'](value) {
    const account = this.store.accounts.filter(a => a.number === value || a.name === value || `${a.number} ${a.name}` === value);
    this.account_id = account[0].id;
  }
  ['proposal.account'](value) {
    let ret = [];
    if (value === '') {
      return ret;
    }
    this.store.accounts.forEach((a) => {
      if (a.number.startsWith(value) || a.name.toLowerCase().startsWith(value.toLowerCase())) {
        ret.push(`${a.number} ${a.name}`);
      }
    });
    if (ret.length === 0) {
      this.store.accounts.forEach((a) => {
        if (a.name.toLowerCase().indexOf(value.toLowerCase()) > 0) {
          ret.push(`${a.number} ${a.name}`);
        }
      });
    }
    return ret;
  }

  /**
   * Turn null account_id to 0.
   */
  async save() {
    if (this.account_id === null) {
      this.account_id = 0;
    }
    return super.save();
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
   * Get the description prefixed by the tags.
   */
  get text() {
    return this.tagNames.length ? '[' + this.tagNames.join('][') + '] ' + this.description : this.description;
  }

  /**
   * Extract tags from the text and set them and the description.
   * @param {String} text
   */
  setText(text) {
    this['change.description'](text);
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

  /**
   * Collect tag instances of this entry.
   */
  get tags() {
    return this.tagNames.map((tag) => this.database.getTag(tag)).sort(TagModel.sorter());
  }

  /**
   * Set or clear a flag.
   * @param {String} name
   * @param {Boolean} value
   */
  setFlag(name, value) {
    if (value) {
      this.flags = this.flags | EntryModel.FLAGS[name];
    } else {
      this.flags = this.flags & ~EntryModel.FLAGS[name];
    }
  }
  /**
   * Get a value of a flag.
   * @param {String} name
   */
  getFlag(name) {
    return !!(this.flags & EntryModel.FLAGS[name]);
  }

  get VAT_IGNORE() { return this.getFlag('VAT_IGNORE'); }
  set VAT_IGNORE(value) { this.setFlag('VAT_IGNORE', value); }
  get VAT_RECONCILED() { return this.getFlag('VAT_RECONCILED'); }
  set VAT_RECONCILED(value) { this.setFlag('VAT_RECONCILED', value); }
}

export default EntryModel;
