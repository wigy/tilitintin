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
import './Transaction.css';

@translate('translations')
@inject('store')
@inject('cursor')
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

    // Handle transaction toggle.
    const onClick = () => {
      this.props.cursor.selectIndex('TransactionTable', this.props.index);
      this.props.tx.open = !this.props.tx.open;
    };

    // Handle editing, when clicked.
    const onClickDetail = (column, row) => {
      this.props.cursor.selectCell(column, row);
    };

    // Handle finalizing editing of a cell.
    const onComplete = (column, row) => {
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
    };

    // Set up variables needed.
    const {selected, selectedColumn, selectedRow} = this.props;
    const classes = 'Transaction' +
      (this.props.selected ? ' selected' : '') +
      (this.props.tx.open ? ' open' : '') +
      (error ? ' error' : '') +
      (this.props.duplicate ? ' duplicate' : '');

    // Render main transaction.
    let ret = [
      <tr id={'Transaction' + this.props.tx.id} key="title" className={classes} onClick={onClick}>
        <td className="number">{this.props.tx.number}</td>
        <td className="date">
          <TransactionDetails
            selected={this.props.tx.open && selected && selectedRow === null}
            type="date"
            tx={this.props.tx}
            entry={null}
          />
        </td>
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

    // Render entries, if opened.
    if (this.props.tx.open) {
      this.props.tx.entries.forEach((entry, idx) => {
        const isSelected = (type) => this.props.selected && selectedColumn === type && idx === selectedRow;
        const current = this.props.tx.account_id === entry.account_id;
        const classes = 'TransactionEntry alt open' +
          (this.props.duplicate ? ' duplicate' : '');

        // Calculate correction to fix total assuming that this entry is the one changed.
        let diff = debit - credit;
        if (entry.debit) {
          diff -= entry.amount;
        } else {
          diff += entry.amount;
        }
        const proposalDebit = diff < 0 ? sprintf('%.2f', -diff / 100) + '' : null;
        const proposalCredit = diff > 0 ? sprintf('%.2f', diff / 100) + '' : null;

        ret.push(
          <tr key={idx} className={classes}>
            <td className="account" colSpan={3} onClick={() => onClickDetail(0, idx)}>
              <TransactionDetails
                error={!entry.account_id}
                selected={isSelected('account')}
                current={current}
                type="account"
                tx={this.props.tx}
                entry={entry}
                onComplete={() => onComplete(0, idx)}
              />
            </td>
            <td className="description" onClick={() => onClickDetail(1, idx)}>
              <TransactionDetails
                selected={isSelected('description')}
                current={current}
                type="description"
                tx={this.props.tx}
                entry={entry}
                onComplete={() => onComplete(1, idx)}
                onClick={() => onClickDetail(1, idx)}
              />
            </td>
            <td className="debit" onClick={() => onClickDetail(2, idx)}>
              <TransactionDetails
                selected={isSelected('debit')}
                current={current}
                type="debit"
                tx={this.props.tx}
                entry={entry}
                onClick={() => onClickDetail()}
                onComplete={() => onComplete(2, idx)}
                proposal={proposalDebit}
              />
            </td>
            <td className="credit" onClick={() => onClickDetail(3, idx)}>
              <TransactionDetails
                selected={isSelected('credit')}
                current={current}
                type="credit"
                tx={this.props.tx}
                entry={entry}
                onClick={() => onClickDetail()}
                onComplete={() => onComplete(3, idx)}
                proposal={proposalCredit}
              />
            </td>
            <td className="empty">
            </td>
          </tr>);
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
  cursor: PropTypes.instanceOf(Cursor),
  tx: PropTypes.object,
  index: PropTypes.number,
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  selected: PropTypes.bool,
  duplicate: PropTypes.bool,
  total: PropTypes.number
};

export default Transaction;
