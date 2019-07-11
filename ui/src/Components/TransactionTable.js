import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import moment from 'moment';
import Dialog from './Dialog';
import Money from './Money';
import Transaction from './Transaction';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import './TransactionTable.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class TransactionTable extends Component {

  // Store for transaction waiting for deletion confirmation.
  txToDelete = null;

  componentDidMount() {
    this.props.cursor.selectPage('Balances', this);
  }

  keyInsert(cursor) {
    const { store } = this.props;
    if (store.period.locked) {
      return;
    }
    if (cursor.row === null) {
      const document = new DocumentModel(store.period, {
        period_id: store.period.id,
        date: store.lastDate || moment().format('YYYY-MM-DD')
      });
      document.save()
        .then(() => {
          const entry = new EntryModel(document, {document_id: document.id, row_number: 1, account_id: store.accountId});
          document.addEntry(entry);
          store.keepDocumentIdOpen = document.id;
          store.period.addDocument(document);
          document.open = true;
          if (cursor.componentX === 0) {
            cursor.keyArrowRight();
          }
          // TODO: Look for correct index.
          cursor.setIndex(store.filteredTransactions.length - 1);
        });

      return {preventDefault: true};
    }
  }

  /**
   * Remove a document and all of its entries from the system.
   * @param {TransactionModel} tx
   */
  deleteDocument(tx) {
    this.props.store.deleteDocument(tx.document)
      .then(() => this.props.cursor.changeIndexBy(-1));
  }

  render() {

    if (!this.props.store.transactions) {
      return '';
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
    let ret = [
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
            sum += tx.entry.total;
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
    ];

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
  store: PropTypes.instanceOf(Store)
};

export default TransactionTable;
