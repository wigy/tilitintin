import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Dialog from './Dialog';
import Money from './Money';
import Transaction from './Transaction';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import './TransactionTable.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class TransactionTable extends Component {

  // Store for transaction waiting for deletion confirmation.
  txToDelete = null;

  /**
   * Remove a transaction and all of its entries from the system.
   * @param {Object} tx
   */
  deleteTransaction(tx) {
    this.props.store.deleteTransaction(tx)
      .then(() => {
        let { index } = this.props.cursor;
        if (index >= this.props.store.transactions.length) {
          index = this.props.store.transactions.length ? index - 1 : null;
          this.props.cursor.selectIndex('TransactionTable', index);
        }
      });
  }

  render() {

    if (!this.props.store.transactions) {
      return '';
    }

    const deleteDialog = (tx) => (<Dialog key="dialog"
      title={<Trans>Delete these transactions?</Trans>}
      isVisible={tx.askDelete}
      onClose={() => { tx.askDelete = false; }}
      onConfirm={() => this.deleteTransaction(tx)}>
      <i>#{tx.number}</i><br/>
      {tx.entries.map((entry, idx) =>
        <div key={idx}>
          <i>{entry.number} {entry.name}:</i><br/>
          {entry.description}
          <b> {entry.debit ? '+' : '-'}<Money currency="EUR" cents={entry.amount}></Money></b>
          <br/>
        </div>
      )}<br/>
    </Dialog>);

    const { component, index, row, column, editor } = this.props.cursor;

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
            if (tx.askDelete) {
              this.txToDelete = tx;
            }
            const duplicate = seen[tx.number];
            seen[tx.number] = true;
            sum += tx.debit ? tx.amount : -tx.amount;
            return <Transaction
              key={idx}
              index={idx}
              selected={component === 'TransactionTable' && index === idx}
              selectedColumn={column !== null ? ['account', 'description', 'debit', 'credit'][column] : null}
              selectedRow={row}
              editor={editor}
              duplicate={duplicate}
              tx={tx}
              total={sum}
            />;
          })}
        </tbody>
      </table>
    ];
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
