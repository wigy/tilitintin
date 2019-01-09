import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { translate, Trans } from 'react-i18next';
import Dialog from './Dialog';
import Money from './Money';
import YYYYMMDD from './YYYYMMDD';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import Store from '../Stores/Store';
import './Transaction.css';

@translate('translations')
@inject('store')
@observer
class Transaction extends Component {

  // Store for entry and its index waiting for deletion confirmation.
  entryToDelete = null;

  @action.bound
  deleteEntry() {
    this.props.store.deleteEntry(this.entryToDelete);
  }

  render() {

    // Calculate imbalance, missing accounts and look for deletion request.
    let debit = 0;
    let credit = 0;
    let missingAccount = false;
    this.props.tx.entries.forEach((entry, idx) => {
      if (entry.askDelete) {
        this.entryToDelete = entry;
      }
      if (entry.debit) {
        debit += entry.amount;
      } else {
        credit += entry.amount;
      }
      if (!entry.account_id) {
        missingAccount = true;
      }
    });
    const smaller = Math.min(debit, credit);
    debit -= smaller;
    credit -= smaller;
    const imbalance = (credit !== debit);
    const error = imbalance || missingAccount;

    // Render top row.
    const money = (<Money cents={this.props.tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    const onClick = () => {
      this.props.tx.open = !this.props.tx.open;
    };

    const {selectedColumn, selectedRow} = this.props;
    const classes = 'Transaction' +
      (this.props.selected ? ' selected' : '') +
      (this.props.tx.open ? ' open' : '') +
      (error ? ' error' : '') +
      (this.props.duplicate ? ' duplicate' : '');

    let ret = [
      <tr id={'Transaction' + this.props.tx.id} key="title" className={classes} onClick={onClick}>
        <td className="number">{this.props.tx.number}</td>
        <td className="date"><YYYYMMDD date={this.props.tx.date}/></td>
        <td className="tags" style={{width: (this.props.tx.tags.length) * 2.6 + 'ex'}}><Tags tags={this.props.tx.tags}/></td>
        <td className="description">
          <span className="summary">{this.props.tx.description}&nbsp;</span>
        </td>
        <td className="debit">
          <span className="summary">&nbsp;{this.props.tx.debit ? money : ''}</span>
        </td>
        <td className="credit">
          <span className="summary">&nbsp;{this.props.tx.debit ? '' : money}</span>
        </td>
        <td className="total">{total}</td>
      </tr>
    ];

    // Render entries.
    this.props.tx.entries.forEach((entry, idx) => {
      const isSelected = (type) => this.props.selected && selectedColumn === type && idx === selectedRow;
      const current = this.props.tx.account_id === entry.account_id;
      const classes = 'alt TransactionEntry' +
        (this.props.tx.open ? ' open' : '') +
        (this.props.duplicate ? ' duplicate' : '');

      // TODO: Onclick should actually activate editing for the clicked target.
      ret.push(
        <tr key={idx} className={classes} onClick={onClick}>
          <td className="account" colSpan={3}>
            <TransactionDetails error={!entry.account_id} selected={isSelected('account')} current={current} type="account" tx={this.props.tx} entry={entry}/>
          </td>
          <td className="description">
            <TransactionDetails selected={isSelected('description')} current={current} type="description" tx={this.props.tx} entry={entry}/>
          </td>
          <td className="debit">
            <TransactionDetails selected={isSelected('debit')} current={current} type="debit" tx={this.props.tx} entry={entry}/>
          </td>
          <td className="credit">
            <TransactionDetails selected={isSelected('credit')} current={current} type="credit" tx={this.props.tx} entry={entry}/>
          </td>
          <td className="empty">
          </td>
        </tr>);
    });

    // Render delete dialog in the dummy row.
    if (this.entryToDelete) {
      ret.push(
        <tr key="delete">
          <td colSpan={7}>
            <Dialog
              title={<Trans>Delete this transaction?</Trans>}
              isVisible={this.entryToDelete.askDelete}
              onClose={() => (this.entryToDelete.askDelete = false)}
              onConfirm={() => this.deleteEntry()}>
              <i>{this.entryToDelete.number} {this.entryToDelete.name}</i><br/>
              {this.entryToDelete.description}<br/>
              <b>{this.entryToDelete.debit ? '+' : '-'}<Money currency="EUR" cents={this.entryToDelete.amount}></Money></b>
            </Dialog>
          </td>
        </tr>
      );
    }

    // Render imbalance
    if (imbalance) {
      ret.push(
        <tr key="imbalance" className={'alt error TransactionEntry' + (this.props.tx.open ? ' open' : '')} onClick={onClick}>
          <td className="account" colSpan={3}></td>
          <td className="description">
            <Trans>Debit and credit do not match</Trans>
          </td>
          <td className="debit">
            {credit ? <Money cents={credit} currency="€"/> : ''}
          </td>
          <td className="credit">
            {debit ? <Money cents={debit} currency="€"/> : ''}
          </td>
          <td className="empty"></td>
        </tr>);
    }

    return ret;
  }
}

Transaction.propTypes = {
  store: PropTypes.instanceOf(Store),
  tx: PropTypes.object,
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  selected: PropTypes.bool,
  duplicate: PropTypes.bool,
  total: PropTypes.number
};

export default Transaction;
