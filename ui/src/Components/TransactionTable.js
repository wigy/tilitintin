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
        this.props.store.filteredTransactions.map((tx, idx) => {
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
