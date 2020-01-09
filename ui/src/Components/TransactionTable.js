import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { Trans, withTranslation } from 'react-i18next';
import { FormControl, ControlLabel } from 'react-bootstrap';
import moment from 'moment';
import { sprintf } from 'sprintf-js';
import Dialog from './Dialog';
import Money from './Money';
import Transaction from './Transaction';
import Loading from './Loading';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import './TransactionTable.css';
import { withRouter } from 'react-router-dom';

@withTranslation('translations')
@withRouter
@inject('store')
@inject('cursor')
@observer
class TransactionTable extends Component {

  state = {
    showAccountDropdown: false
  };

  // Store for transaction waiting for deletion confirmation.
  txToDelete = null;

  componentDidMount() {
    this.props.cursor.selectPage('Balances', this);
  }

  componentDidUpdate(oldProps) {
    const eid = new URLSearchParams(this.props.location.search).get('entry');
    if (eid) {
      this.props.cursor.setIndex(null);
      this.closeAll();
      this.props.history.push(this.props.location.pathname);
    }
  }

  closeAll() {
    this.props.store.filteredTransactions.forEach(tx => {
      if (tx.open) {
        tx.toggleOpen();
      }
    });
  }

  keyEscape(cursor) {
    if (cursor.index === null) {
      this.closeAll();
      return {preventDefault: true};
    }
  }

  keyTab(cursor) {
    const { store } = this.props;
    if (store.period.locked) {
      return;
    }
    if (cursor.componentX !== 1) {
      return;
    }
    // Insert entry.
    const currentDoc = store.filteredTransactions[cursor.index].document;
    const rowNumber = currentDoc.entries.reduce((prev, cur) => Math.max(prev, cur.row_number), 0) + 1;
    const description = currentDoc.entries.length ? currentDoc.entries[currentDoc.entries.length - 1].text : '';
    const entry = new EntryModel(currentDoc, {document_id: currentDoc.id, row_number: rowNumber, description});
    currentDoc.addEntry(entry);
    cursor.setCell(0, currentDoc.entries.length - 1);

    return {preventDefault: true};
  }

  keyInsert(cursor) {
    const { store } = this.props;
    if (store.period.locked) {
      return;
    }
    if (!store.accountId) {
      this.setState({ showAccountDropdown: true });
      return;
    }

    // Insert new document.
    const document = new DocumentModel(store.period, {
      period_id: store.period.id,
      date: store.lastDate || moment().format('YYYY-MM-DD')
    });
    document.save()
      .then(() => {
        const entry = new EntryModel(document, {document_id: document.id, row_number: 1, account_id: store.accountId});
        document.addEntry(entry);
        store.period.addDocument(document);
        entry.toggleOpen();
        if (cursor.componentX === 0) {
          cursor.keyArrowRight();
        }
        const index = store.filteredTransactions.findIndex(tx => document.id === tx.document.id);
        cursor.setIndex(index >= 0 ? index : store.filteredTransactions.length - 1);
      });

    return {preventDefault: true};
  }

  /**
   * Collect current transaction.
   */
  keyCtrlC(cursor) {
    if (cursor.index === null) {
      return;
    }
    if (cursor.componentX !== 1) {
      return;
    }

    const { store } = this.props;
    const doc = store.filteredTransactions[cursor.index].document;

    if (cursor.row !== null) {
      // Copy one cell.
      const entry = doc.entries[cursor.row];
      const column = entry.column;
      let text;
      switch (column) {
        case 'account':
          text = entry.account.toString();
          break;
        case 'description':
          text = entry[column];
          break;
        case 'debit':
          text = entry.debit ? sprintf('%.2f', entry.amount / 100) : '';
          break;
        case 'credit':
          text = entry.debit ? '' : sprintf('%.2f', entry.amount / 100) + '';
          break;
        default:
      }
      navigator.clipboard.writeText(text);
      return;
    }

    // Copy entire document with entries.
    let text = `${doc.number}\t${doc.date}\n`;
    doc.entries.forEach(e => {
      text += [e.account.toString(), e.description, e.debit ? e.amount : '', e.debit ? '' : e.amount].join('\t') + '\n';
    });
    navigator.clipboard.writeText(text);
  }

  /**
   * Create new document if valid clipboard.
   * @param {Cursor} cursor
   */
  keyCtrlV(cursor) {
    if (cursor.index === null) {
      return;
    }
    if (cursor.componentX !== 1) {
      return;
    }
    if (cursor.row !== null) {
      // Copy one cell.
      const doc = this.props.store.filteredTransactions[cursor.index].document;
      const entry = doc.entries[cursor.row];
      const column = entry.column;
      navigator.clipboard.readText().then(text => {
        if (entry[`validate.${column}`](text) === null) {
          entry[`change.${column}`](text);
          entry.save();
        }
      });
      return;
    }

    // Copy entire document.
    navigator.clipboard.readText().then(text => {
      // Verify the correct format and construct document.
      if (text.endsWith('\n')) {
        text = text.substr(0, text.length - 1);
        const lines = text.split('\n');
        if (lines.length >= 2) {
          const head = lines[0].split('\t');
          if (head.length === 2 && /^\d+$/.test(head[0]) && /^\d\d\d\d-\d\d-\d\d$/.test(head[1])) {
            const [, date] = head;
            const entries = [];
            let i;
            for (i = 1; i < lines.length; i++) {
              const [acc, description, debit, credit] = lines[i].split('\t');
              if (/^\d+ /.test(acc) && (/^\d+$/.test(debit) || /^\d+$/.test(credit))) {
                entries.push({
                  description,
                  number: parseInt(acc),
                  amount: debit === '' ? -parseInt(credit) : parseInt(debit)
                });
              } else {
                break;
              }
            }
            // Not all valid. Skip.
            if (i < lines.length) {
              return;
            }
            // Create new document.
            const { store } = this.props;
            store.period.createDocument({
              date,
              entries
            });
          }
        }
      }
    });
  }

  /**
   * Remove a document and all of its entries from the system.
   * @param {TransactionModel} tx
   */
  deleteDocument(tx) {
    this.props.store.deleteDocument(tx.document)
      .then(() => this.props.cursor.changeIndexBy(-1));
  }

  /**
   * Select the initial account on empty table.
   */
  async onSelectAccount(id) {
    if (!id) {
      return;
    }
    await this.props.store.setAccount(this.props.store.db, this.props.store.periodId, id);
    this.keyInsert(this.props.cursor);
  }

  render() {
    let ret = [];

    ret.push(<Loading visible={this.props.store.loading} key="loading-indicator"/>);

    if (this.state.showAccountDropdown) {
      const accountDialog = (
        <Dialog key="dialog2"
          title={<Trans>Please select an account</Trans>}
          isVisible={this.state.showAccountDropdown}
          onClose={() => this.setState({ showAccountDropdown: false })}
          onConfirm={() => this.onSelectAccount(this.state.account)}>
          <ControlLabel><Trans>Account</Trans>:</ControlLabel>
          <FormControl componentClass="select" value={this.state.account} onChange={(e) => this.setState({ account: e.target.value })}>
            <option value=""></option>
            {this.props.store.accounts.map(a => <option value={a.id} key={a.id}>{a.toString()}</option>)}
          </FormControl>
        </Dialog>
      );
      ret.push(accountDialog);
    }

    if (!this.props.store.transactions.length) {
      ret.push(<Trans key="insert">Press Insert to create a transaction.</Trans>);
      return ret;
    }

    const deleteDialog = (tx) => (<Dialog key="dialog"
      title={<Trans>Delete these transactions?</Trans>}
      isVisible={tx.document.askForDelete}
      onClose={() => { tx.document.askForDelete = false; this.txToDelete = null; }}
      onConfirm={() => this.deleteDocument(tx)}>
      <i>#{tx.document.number}</i><br/>
      {tx.document.entries.map((entry, idx) =>
        <div key={idx}>
          <i>{entry.account && entry.account.toString()}:</i><br/>
          {entry.description} <b> {entry.debit ? '+' : '-'}<Money currency="EUR" cents={entry.amount}></Money></b><br/>
        </div>
      )}<br/>
    </Dialog>);

    let sum = 0;
    let seen = {};
    ret.push(
      <table key="table" className="TransactionTable">
        <thead>
          <tr className="Transaction heading">
            <th className="number">#</th>
            <th className="date"><Trans>Date</Trans></th>
            <th className="tags"></th>
            <th className="description"><Trans>Description</Trans></th>
            <th className="debit"><Trans>Debit</Trans></th>
            <th className="credit"><Trans>Credit</Trans></th>
            <th className="total"><Trans>Total</Trans></th>
          </tr>
        </thead>
        <tbody>{
          this.props.store.filteredTransactions.map((tx, idx) => {
            if (tx.document.askForDelete) {
              this.txToDelete = tx;
            }
            const duplicate = seen[tx.document.number];
            seen[tx.document.number] = true;
            sum += tx.total;
            return <Transaction
              key={idx}
              index={idx}
              duplicate={duplicate}
              tx={tx}
              total={sum}
            />;
          })}
        </tbody>
      </table>
    );

    /*
    Cursor debug helper.
    ret.push(<div key="my">Index {JSON.stringify(this.props.cursor.index)}</div>);
    ret.push(<div key="my1">Column {JSON.stringify(this.props.cursor.column)}</div>);
    ret.push(<div key="my2">Row {JSON.stringify(this.props.cursor.row)}</div>);
    */

    if (this.txToDelete) {
      ret.push(deleteDialog(this.txToDelete));
    }

    return ret;
  }
}

TransactionTable.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  location: PropTypes.object,
  history: ReactRouterPropTypes.history,
  store: PropTypes.instanceOf(Store)
};

export default TransactionTable;
