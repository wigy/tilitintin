import React from 'react';
import { Link } from 'react-router-dom';
import { sprintf } from 'sprintf-js';
import { Trans } from 'react-i18next';
import NavigationTargetModel from './NavigationTargetModel';
import TagModel from './TagModel';
import Money from '../Components/Money';

// Helper to evaluate string expression value to number.
const str2num = (str) => {
  str = str.replace(',', '.').replace(/ /g, '');
  try {
    //  TODO: This crashes for some reason: safeEval(str, {navigator: window.navigator});
    /* eslint no-eval: off */
    return eval(str);
  } catch (err) {
    return NaN;
  }
};

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
   * Check if the cell is currently selected.
   * @param {Number} column
   * @param {Number} row
   */
  isSubSelected(column, row) {
    return (
      row !== null &&
      this.document.entries.indexOf(this) === row &&
      column !== null &&
      this.columns()[column] === this.column
    );
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
      (!this.account_id ? ' error' : '');
  }

  /**
   * This is editable.
   */
  canEdit() {
    return true;
  }

  /**
   * Description is required.
   * @param {String} value
   */
  ['validate.description'](value) {
    const REQUIRED = <Trans>This field is required.</Trans>;
    return value ? null : REQUIRED;
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
  /**
   * Render link to the transaction listing of the account. For editing, use account number.
   */
  ['get.account']() {
    const onClick = () => this.props.cursor.setIndex('TransactionTable', null);
    let url = '/' + this.database.name + '/txs/' + this.period.id + '/' + this.account_id;
    return <Link onClick={onClick} to={url}>{this.account.toString()}</Link>;
  }
  ['get.edit.account']() {
    return this.account.number;
  }
  ['validate.account'](value) {
    const INVALID_ACCOUNT = <Trans>No such account found.</Trans>;
    return this.store.accounts.filter(a => a.number === value).length ? null : INVALID_ACCOUNT;
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
