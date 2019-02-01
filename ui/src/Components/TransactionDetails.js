import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';
import Money from './Money';
import TextEdit from './TextEdit';
import Store from '../Stores/Store';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import Cursor from '../Stores/Cursor';
import { sprintf } from 'sprintf-js';
import moment from 'moment';

// import safeEval from 'safer-eval';

import './TransactionDetails.css';

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

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class TransactionDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {proposal: props.proposal};
  }

  render() {
    let text;
    let edit;
    let url;

    switch (this.props.type) {
      case 'debit':
        text = this.props.entry.debit && this.props.entry.amount !== '' ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        edit = this.props.entry.debit ? sprintf('%.2f', this.props.entry.amount / 100) : '';
        break;
      case 'credit':
        text = !this.props.entry.debit && this.props.entry.amount !== '' ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        edit = !this.props.entry.debit ? sprintf('%.2f', this.props.entry.amount / 100) : '';
        break;
      case 'account':
        const onClick = () => this.props.cursor.setIndex('TransactionTable', null);
        url = '/' + this.props.entry.db.name + '/txs/' + this.props.entry.period.id + '/' + this.props.entry.account_id;
        text = <Link onClick={onClick} to={url}>{this.props.entry.number} {this.props.entry.name}</Link>;
        edit = this.props.entry.number;
        break;
      case 'description':
        text = this.props.entry.description;
        edit = text;
        break;
      case 'date':
        // TODO: Locale awareness.
        text = moment(this.props.document.date).format('DD.MM.YYYY');
        edit = text;
        break;
      default:
        text = 'TODO';
        edit = '';
    }

    // A function called after editing is finished.
    const onComplete = async (value) => {

      let data = {};

      switch (this.props.type) {
        case 'debit':
          if (value !== '') {
            data.debit = 1;
            data.amount = Math.round(str2num(value) * 100);
          }
          break;
        case 'credit':
          if (value !== '') {
            data.debit = 0;
            data.amount = Math.round(str2num(value) * 100);
          }
          break;
        case 'account':
          const account = this.props.store.accounts.filter(a => a.number === value);
          data.account_id = account[0].id;
          break;
        case 'description':
          data.description = value;
          data.tags = Object.values(this.props.entry.tags);
          break;
        case 'date':
          data.date = str2date(value, this.props.store.lastDate);
          this.props.store.lastDate = data.date;
          break;
        default:
      }

      if (Object.keys(data).length === 0) {
        this.props.cursor.editor = null;
        return Promise.resolve();
      }

      // Update or create transaction first.
      if (data.date || !this.props.entry.document_id) {
        await this.props.store.saveDocument(this.props.document, data);
        if (this.props.entry) {
          this.props.entry.document_id = this.props.document.id;
        } else {
          this.props.cursor.selectCell(1, 0);
          return Promise.resolve();
        }
      }

      return this.props.store.saveEntry(this.props.entry, data, this.props.document)
        .then((res) => {
          this.props.cursor.selectEditing(false);
        });
    };

    // Cancel editing.
    const onCancel = () => {
      this.props.cursor.editor = null;
    };

    // Value changed.
    const onChange = (value) => {
      let proposal = null;
      switch (this.props.type) {
        case 'account':
          break;
        case 'description':
          if (value.endsWith(' ')) {
            proposal = this.props.store.descriptionProposal(this.props.entry, value);
          }
          break;
        case 'credit':
        case 'debit':
          if (value === ' ') {
            proposal = this.props.proposal;
          }
          break;
        case 'date':
          break;
        default:
          return 'TODO';
      }
      this.setState({proposal});
    };

    // Validator of the value.
    const validate = (value) => {

      const REQUIRED = <Trans>This field is required.</Trans>;
      const INVALID_ACCOUNT = <Trans>No such account found.</Trans>;
      const INVALID_NUMBER = <Trans>Numeric value incorrect.</Trans>;
      const NO_NEGATIVE = <Trans>Cannot be negative.</Trans>;
      const INVALID_DATE = <Trans>Date is incorrect.</Trans>;

      switch (this.props.type) {
        case 'account':
          return this.props.store.accounts.filter(a => a.number === value).length ? null : INVALID_ACCOUNT;
        case 'description':
          return value ? null : REQUIRED;
        case 'credit':
        case 'debit':
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
        case 'date':
          return str2date(value, this.props.store.lastDate) ? null : INVALID_DATE;
        default:
          return 'TODO';
      }
    };

    // TODO: Must handle editing of the entry's account number, when it is the same as transaction's.

    // Show editor instead, if it is turned on.
    if (this.props.selected && this.props.cursor.editor) {
      return (<TextEdit
        value={edit}
        validate={validate}
        proposal={this.state.proposal}
        onComplete={value => onComplete(value).then(() => {
          this.props.onComplete && this.props.onComplete();
        })}
        onChange={(value) => onChange(value)}
        onCancel={() => onCancel()}
      />);
    }

    const className = 'TransactionDetails ' +
      (this.props.current ? ' current' : '') +
      (this.props.selected ? ' selected' : '') +
      (this.props.error ? ' error' : '');

    return (
      <div className={className}>{text}&nbsp;</div>
    );
  }
}

TransactionDetails.propTypes = {
  document: PropTypes.instanceOf(DocumentModel),
  entry: PropTypes.instanceOf(EntryModel),
  type: PropTypes.string,
  proposal: PropTypes.string,
  current: PropTypes.bool,
  selected: PropTypes.bool,
  error: PropTypes.bool,
  onComplete: PropTypes.func,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default TransactionDetails;
