import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { translate, Trans } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import Dialog from './Dialog';
import Money from './Money';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import EntryModel from '../Models/EntryModel';
import './Transaction.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Transaction extends Component {

  // Temporary store for entry waiting for deletion confirmation.
  entryToDelete = null;

  @action.bound
  deleteEntry() {
    this.props.store.deleteEntry(this.entryToDelete);
  }

  // Handle transaction toggle.
  @action.bound
  onClick() {
    this.props.cursor.selectIndex('TransactionTable', this.props.index);
    this.props.tx.document.open = !this.props.tx.document.open;
  }

  // Select cell, when clicked.
  @action.bound
  onClickDetail(column, row) {
    this.props.cursor.selectCell(column, row);
  }

  // Handle finalizing editing of a cell.
  @action.bound
  onComplete(column, row) {
    column++;
    if (column === 4) {
      column = 0;
      row++;
      // Oops, we are on the last column of last row.
      if (row >= this.props.tx.entries.length) {
        column = 3;
        row--;
      }
    }
    this.props.cursor.selectCell(column, row);
  }

  // Render the main row of the document, i.e. the entry having the current account and data from document it belongs to.
  renderMainTx(classes) {
    const {tx, selected, selectedRow} = this.props;

    const money = (<Money cents={tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    return (
      <tr id={'Transaction' + tx.id} key="title" className={classes} onClick={() => this.onClick()}>
        <td className="number">
          {tx.document.number}
        </td>
        <td className="date">
          <TransactionDetails
            selected={tx.open && selected && selectedRow === null}
            type="date"
            document={tx.document}
          />
        </td>
        <td className="tags" style={{width: (tx.tags.length) * 2.6 + 'ex'}}>
          <Tags tags={tx.tags}/>
        </td>
        <td className="description">
          <span className="summary">{tx.description}&nbsp;</span>
        </td>
        <td className="debit">
          <span className="summary">&nbsp;{tx.debit ? money : ''}</span>
        </td>
        <td className="credit">
          <span className="summary">&nbsp;{tx.debit ? '' : money}</span>
        </td>
        <td className="total">
          {total}
        </td>
      </tr>
    );
  }

  // Render an entry for opened document.
  renderEntry(idx, entry, diff) {
    const {tx, duplicate, selectedColumn, selectedRow} = this.props;
    const isSelected = (type) => this.props.selected && selectedColumn === type && idx === selectedRow;
    const current = tx.account_id === entry.account_id;
    const classes = 'TransactionEntry alt open' + (duplicate ? ' duplicate' : '');

    // Calculate correction to fix total assuming that this entry is the one changed.
    if (entry.debit) {
      diff -= entry.amount;
    } else {
      diff += entry.amount;
    }

    const proposalDebit = diff < 0 ? sprintf('%.2f', -diff / 100) + '' : null;
    const proposalCredit = diff > 0 ? sprintf('%.2f', diff / 100) + '' : null;

    return (
      <tr key={idx} className={classes}>
        <td className="account" colSpan={3} onClick={() => this.onClickDetail(0, idx)}>
          <TransactionDetails
            error={!entry.account_id}
            selected={isSelected('account')}
            current={current}
            type="account"
            document={entry.document}
            entry={entry}
            onComplete={() => this.onComplete(0, idx)}
          />
        </td>
        <td className="description" onClick={() => this.onClickDetail(1, idx)}>
          <TransactionDetails
            selected={isSelected('description')}
            current={current}
            type="description"
            document={entry.document}
            entry={entry}
            onComplete={() => this.onComplete(1, idx)}
            onClick={() => this.onClickDetail(1, idx)}
          />
        </td>
        <td className="debit" onClick={() => this.onClickDetail(2, idx)}>
          <TransactionDetails
            selected={isSelected('debit')}
            current={current}
            type="debit"
            document={entry.document}
            entry={entry}
            onClick={() => this.onClickDetail()}
            onComplete={() => this.onComplete(2, idx)}
            proposal={proposalDebit}
          />
        </td>
        <td className="credit" onClick={() => this.onClickDetail(3, idx)}>
          <TransactionDetails
            selected={isSelected('credit')}
            current={current}
            type="credit"
            document={entry.document}
            entry={entry}
            onClick={() => this.onClickDetail()}
            onComplete={() => this.onComplete(3, idx)}
            proposal={proposalCredit}
          />
        </td>
        <td className="empty">
          &nbsp;
        </td>
      </tr>
    );
  }

  render() {
    const tx = this.props.tx;

    // Calculate imbalance, missing accounts, mismatching account, and look for deletion request.
    let debit = 0;
    let credit = 0;
    let missingAccount = false;
    let mismatchingAccount = /* true */ false;
    /*
    TODO: Re-implement.
    tx.entries.forEach((entry, idx) => {
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
      } else {
        if (entry.account_id === tx.account_id) {
          mismatchingAccount = false;
        }
      }
    });
    */
    const smaller = Math.min(debit, credit);
    debit -= smaller;
    credit -= smaller;
    const imbalance = (credit !== debit);
    const error = imbalance || missingAccount;

    // Set up CSS classes.
    const classes = 'Transaction' +
      (this.props.selected ? ' selected' : '') +
      (tx.open ? ' open' : '') +
      (error ? ' error' : '') +
      (mismatchingAccount ? ' mismatch' : '') +
      (this.props.duplicate ? ' duplicate' : '');

    // Render main transaction.
    let ret = [
      this.renderMainTx(classes)
    ];

    // Render entries, if opened.
    if (tx.document.open && !this.props.duplicate) {
      tx.document.entries.forEach((entry, idx) => {
        ret.push(this.renderEntry(idx, entry, debit - credit));
      });
    }

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
        <tr key="imbalance" className={'alt error TransactionEntry' + (tx.open ? ' open' : '')} onClick={() => this.onClick()}>
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
  cursor: PropTypes.instanceOf(Cursor),
  tx: PropTypes.instanceOf(EntryModel),
  index: PropTypes.number,
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  selected: PropTypes.bool,
  duplicate: PropTypes.bool,
  total: PropTypes.number
};

export default Transaction;
