import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Transaction from './Transaction';
import './TransactionTable.css';

export default inject('store')(observer(class TransactionTable extends Component {

  render() {

    if (!this.props.txs) {
      return;
    }

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
    return (<table className="TransactionTable">
      <thead>
        <tr className="Transaction heading">
          <th className="number">#</th>
          <th className="date">Päiväys</th>
          <th className="tags"></th>
          <th className="description">Kuvaus</th>
          <th className="debit">Debet</th>
          <th className="credit">Kredit</th>
          <th className="total">Yhteensä</th>
        </tr>
      </thead>
      <tbody>{
        filter(this.props.txs).map((tx, idx) => {
          return <Transaction key={idx} tx={tx} total={sum+=(tx.debit ? tx.amount : -tx.amount)}/>;
        })}
      </tbody>
    </table>
    );
  }
}));
