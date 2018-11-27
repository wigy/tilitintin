import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';
import Money from './Money';
import TextEdit from './TextEdit';
import { sprintf } from 'sprintf-js';

import './TransactionDetails.css';

// Helper to convert string value to number.
const str2num = (str) => {
  try {
    return parseFloat(str.replace(',', '.').replace(/ /g, ''));
  } catch(err) {
    return NaN;
  }
}

export default translate('translations')(inject('store')(observer(class TransactionDetails extends Component {

  render() {
    let text;
    let edit;
    let url;

    switch(this.props.type) {
      case 'debit':
        text = this.props.entry.debit ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        edit = this.props.entry.debit ? sprintf('%.2f', this.props.entry.amount / 100) : '';
        break;
      case 'credit':
        text = !this.props.entry.debit ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        edit = !this.props.entry.debit ? sprintf('%.2f', this.props.entry.amount / 100) : '';
        break;
      case 'account':
        url = '/' + this.props.tx.db + '/txs/' + this.props.tx.period_id + '/' + this.props.entry.account_id;
        text = <Link to={url}>{this.props.entry.number} {this.props.entry.name}</Link>;
        edit = this.props.entry.number;
        break;
      case 'description':
        text = this.props.entry.description;
        edit = text;
        break;
      default:
        text = '';
        edit = '';
    }

    // A function called after editing is finished.
    const onComplete = (value) => {

      let data = {};
      // TODO: Handle debit/credit change.
      // TODO: Add imbalance, when not in balance.
      switch(this.props.type) {
        case 'debit':
          data.debit = 1;
          data.amount = Math.round(str2num(value) * 100);
          break;
        case 'credit':
          data.debit = 0;
          data.amount = Math.round(str2num(value) * 100);
          break;
        case 'account':
          const account = this.props.store.accounts.filter(a => a.number === value);
          data.account_id = account[0].id;
          break;
        case 'description':
          data.description = value;
          data.tags = Object.values(this.props.entry.tags);
          break;
        default:
      }

      return this.props.store.saveEntry(this.props.entry, data)
        .then((res) => {
          this.props.store.selected.editor = null;
        });
    }

    // Validator of the value.
    const validate = (value) => {

      const REQUIRED = <Trans>This field is required.</Trans>;
      const INVALID_ACCOUNT = <Trans>No such account found.</Trans>;
      const INVALID_NUMBER = <Trans>Numeric value incorrect.</Trans>;

      switch(this.props.type) {
        case 'account':
          return this.props.store.accounts.filter(a => a.number === value).length ? null : INVALID_ACCOUNT;
        case 'description':
          return value ? null : REQUIRED;
        default:
          return isNaN(str2num(value)) && INVALID_NUMBER;
      }
    };

    // Show editor instead, if it is turned on.
    if (this.props.selected && this.props.store.selected.editor) {
      return (<TextEdit
        value={edit}
        validate={validate}
        onComplete={value => onComplete(value)}
      />);
    }

    const className = 'TransactionDetails ' + (this.props.current ? ' current' : '') + (this.props.selected ? ' selected' : '');
    return (
      <div className={className}>{text}</div>
    );
  };
})));
