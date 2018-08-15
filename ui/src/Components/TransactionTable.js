import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Transaction from './Transaction';
import './TransactionTable.css';

export default translate('translations')(inject('store')(observer(class TransactionTable extends Component {

  render() {

    if (!this.props.store.transactions) {
      return '';
    }

    // TODO: Filtering must be moved to the store and use filtered results from there.
    const visible = (tx) => {
      const allEnabled = Object.values(this.props.store.tools.tagDisabled).filter((v) => v).length === 0;
      if (!tx.tags || !tx.tags.length) {
        return allEnabled;
      }
      let disabled = true;
      tx.tags.forEach((tag) => {
        if (!this.props.store.tools.tagDisabled[tag]) {
          disabled = false;
        }
      });
      return !disabled;
    };

    const filter = (txs) => {
      return txs.filter((tx) => visible(tx));
    };

    let sum = 0;
    let seen = {};
    return (<table className="TransactionTable">
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
        filter(this.props.store.filteredTransactions).map((tx, idx) => {
          const { component, index } = this.props.store.selected;
          const duplicate = seen[tx.number];
          seen[tx.number] = true;
          return <Transaction key={idx} selected={component === 'TransactionTable' && index === idx} duplicate={duplicate} tx={tx} total={sum+=(tx.debit ? tx.amount : -tx.amount)}/>;
        })}
      </tbody>
    </table>
    );
  }
})));
