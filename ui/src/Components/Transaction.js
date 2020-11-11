import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { withTranslation, Trans } from 'react-i18next';
import Dialog from './Dialog';
import Money from './Money';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import Cursor from '../Stores/Cursor';
import EntryModel from '../Models/EntryModel';
import './Transaction.css';
import { TableRow, TableCell } from '@material-ui/core';

@withTranslation('translations')
@inject('store')
@inject('settings')
@inject('cursor')
@observer
class Transaction extends Component {

  // Temporary store for entry waiting for deletion confirmation.
  entryToDelete = null;

  @action.bound
  deleteEntry() {
    const { index, column, row } = this.props.cursor;
    this.props.store.deleteEntry(this.entryToDelete)
      .then(() => {
        this.props.cursor.setIndex(index);
        this.props.cursor.setCell(column, row);
      });
  }

  // Move to the transaction and toggle it.
  @action.bound
  onClick() {
    this.props.cursor.setComponent('Balances.transactions');
    this.props.cursor.setIndex(this.props.index);
    this.props.cursor.keyEnter();
  }

  // Select cell, when clicked.
  @action.bound
  onClickDetail(column, row) {
    this.props.cursor.setCell(column, row);
  }

  // Handle finalizing editing of a cell.
  @action.bound
  async onComplete(column, row, proposal) {
    // Helper to create VAT entry, if needed.
    const checkAndAddVat = (VATAccount, debit) => {
      const document = this.props.tx.document;
      const entry = document.entries[row];
      const account = entry.account;
      if (!account) {
        return;
      }
      const vatAccount = this.props.store.database.getAccountByNumber(VATAccount);
      if (account.vat_percentage) {
        if (document.entries.filter(e => e.account_id === vatAccount.id).length === 0) {
          const vat = new EntryModel(document, {
            id: vatAccount.id,
            amount: debit ? Math.round(account.vat_percentage * entry.amount / 100)
              : Math.round(-account.vat_percentage * entry.amount / 100)
          });
          document.createEntry(vat);
        }
      }
    };

    // If proposal used, do some additional preparation based on that.
    if (column === 1 && proposal !== null) {
      const store = this.props.store;
      const document = this.props.tx.document;
      const entry = document.entries[row];
      const account = entry.account;
      if (document.entries.length === 1 && document.entries[0].amount === 0 && account) {
        let proposals = await store.fetchEntryProposals(store.db, account.id);
        proposals = proposals
          .filter(p => p.description === proposal && p.credit !== 0 && p.debit !== 0)
          .sort((a, b) => b.documentId - a.documentId);
        if (proposals.length > 0) {
          const { documentId } = proposals[0];
          const old = await store.fetchRawDocument(documentId);
          for (const e of old.entries) {
            if (e.account_id !== account.id) {
              await document.createEntry({
                id: e.account_id,
                amount: e.debit ? e.amount : -e.amount,
                description: e.description
              });
            } else {
              entry.amount = e.amount;
              entry.debit = e.debit;
              await entry.save();
            }
          }
        }
      }
    // Automatically add VAT entry for purchases.
    } else if (column === 2) {
      checkAndAddVat(this.props.settings.VAT_PURCHASES_ACCOUNT, 1);
    // Automatically add VAT entry for sales.
    } else if (column === 3) {
      checkAndAddVat(this.props.settings.VAT_SALES_ACCOUNT, 0);
    }

    column++;
    if (column === 4) {
      column = 0;
      row++;
      // Oops, we are on the last column of last row.
      if (row >= this.props.tx.document.entries.length) {
        column = 3;
        row--;
      }
    }
    this.props.cursor.setCell(column, row);
  }

  // Render the main row of the document, i.e. the entry having the current account and data from document it belongs to.
  renderMainTx(classes) {
    const { tx } = this.props;

    const money = (<Money cents={tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    return (
      <TableRow id={tx.getId()} key="title" className={classes} onClick={() => this.onClick()}>
        <TableCell>
          {tx.document.number}
        </TableCell>
        <TableCell>
          <TransactionDetails
            index={this.props.index}
            field="date"
            classNames={tx.open && this.props.index === this.props.cursor.index && this.props.cursor.row === null ? 'sub-selected' : ''}
            document={tx.document}
            onComplete={(doc, proposal) => {
              // Find the new row after order by date has been changed.
              const numbers = this.props.store.filteredTransactions.map(tx => tx.document.number);
              const index = numbers.indexOf(doc.number);
              this.props.cursor.setIndex(index);
              this.props.cursor.setCell(0, 0);
            }}
          />
        </TableCell>
        <TableCell>
          <Tags tags={tx.tags}></Tags>
        </TableCell>
        <TableCell>
          {tx.description}
        </TableCell>
        <TableCell align="right">
          {tx.debit ? money : ''}
        </TableCell>
        <TableCell align="right">
          {tx.debit ? '' : money}
        </TableCell>
        <TableCell align="right">
          {total}
        </TableCell>
      </TableRow>
    );
  }

  // Render an entry for opened document.
  renderEntry(idx, tx) {
    const classes = 'TransactionEntry alt open';
    const id = `tx${tx.document.id}-row${idx}`;
    const entry = tx.document.entries[idx];

    return (
      <tr id={id} key={idx} className={classes}>
        <td className="account" colSpan={3} onClick={() => this.onClickDetail(0, idx)}>
          <TransactionDetails
            index={this.props.index}
            error={!entry.account_id}
            field="account"
            document={entry.document}
            entry={entry}
            onComplete={(_, proposal) => this.onComplete(0, idx, proposal)}
          />
        </td>
        <td className="description" onClick={() => this.onClickDetail(1, idx)}>
          <TransactionDetails
            index={this.props.index}
            field="description"
            document={entry.document}
            entry={entry}
            onComplete={(_, proposal) => this.onComplete(1, idx, proposal)}
            onClick={() => this.onClickDetail(1, idx)}
          />
        </td>
        <td className="debit" onClick={() => this.onClickDetail(2, idx)}>
          <TransactionDetails
            index={this.props.index}
            field="debit"
            document={entry.document}
            entry={entry}
            onClick={() => this.onClickDetail()}
            onComplete={(_, proposal) => this.onComplete(2, idx, proposal)}
          />
        </td>
        <td className="credit" onClick={() => this.onClickDetail(3, idx)}>
          <TransactionDetails
            index={this.props.index}
            field="credit"
            document={entry.document}
            entry={entry}
            onClick={() => this.onClickDetail()}
            onComplete={(_, proposal) => this.onComplete(3, idx, proposal)}
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
    let missingAccount = false;
    let mismatchingAccount = false;

    tx.document.entries.forEach((entry, idx) => {
      if (entry.askForDelete) {
        this.entryToDelete = entry;
      }
      if (entry.account_id === 0) { // Null account_id is valid until first save, when it turns to 0.
        missingAccount = true;
      } else {
        if (entry.account_id === tx.account_id) {
          mismatchingAccount = false;
        }
      }
    });

    const imbalance = tx.document.imbalance();
    const error = !!imbalance || missingAccount;

    // Set up CSS classes.
    // TODO: Sort out classes and use material ui where possible (like 'selected').
    const classes = tx.document.getClasses() +
      (error ? ' error' : '') +
      (mismatchingAccount ? ' mismatch' : '') +
      (this.props.duplicate ? ' duplicate' : '');

    // Render main transaction.
    const ret = [
      this.renderMainTx(classes)
    ];

    /*
    TODO: Handle.

    // Render entries, if opened.
    if (tx.document.open && !this.props.duplicate) {
      tx.document.entries.forEach((_, idx) => {
        ret.push(this.renderEntry(idx, tx));
      });
    }

    // Render delete dialog in the dummy row.
    if (this.entryToDelete) {
      ret.push(
        <tr key="delete">
          <td colSpan={7}>
            <Dialog
              title={<Trans>Delete this transaction?</Trans>}
              isVisible={this.entryToDelete.askForDelete}
              onClose={() => { this.entryToDelete.askForDelete = null; this.entryToDelete.askForDelete = false; }}
              onConfirm={() => this.deleteEntry()}>
              <i>{this.entryToDelete.account && this.entryToDelete.account.toString()}</i><br/>
              {this.entryToDelete.description}<br/>
              <b>{this.entryToDelete.debit ? '+' : '-'}<Money currency="EUR" cents={this.entryToDelete.amount}></Money></b>
            </Dialog>
          </td>
        </tr>
      );
    }

    // Render imbalance
    if (imbalance && this.props.tx.document.open) {
      ret.push(
        <tr key="imbalance" className={'alt error TransactionEntry'} onClick={() => this.onClick()}>
          <td className="account" colSpan={3}></td>
          <td className="description">
            <Trans>Debit and credit do not match</Trans>
          </td>
          <td className="debit">
            {imbalance < 0 ? <Money cents={imbalance} currency="€"/> : ''}
          </td>
          <td className="credit">
            {imbalance > 0 ? <Money cents={imbalance} currency="€"/> : ''}
          </td>
          <td className="empty"></td>
        </tr>);
    }
    */

    return ret;
  }
}

Transaction.propTypes = {
  store: PropTypes.instanceOf(Store),
  settings: PropTypes.instanceOf(Settings),
  cursor: PropTypes.instanceOf(Cursor),
  tx: PropTypes.instanceOf(EntryModel),
  index: PropTypes.number,
  duplicate: PropTypes.bool,
  total: PropTypes.number
};

export default Transaction;
