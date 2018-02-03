import React from 'react';
import Transaction from './Transaction';
import './TransactionTable.css';

const TransactionTable = (props) => {
  if (!props.txs) {
    return;
  }
  let sum = 0;
  return (<table className="TransactionTable">
    <thead>
      <tr>
        <th className="number">#</th>
        <th className="date">Date</th>
        <th className="tags"></th>
        <th className="description">Description</th>
        <th className="debit">Debit</th>
        <th className="credit">Credit</th>
        <th className="total">Total</th>
      </tr>
    </thead>
    <tbody>
    {props.txs.map((tx, idx) => (<Transaction key={idx} tx={tx} total={sum+=(tx.debit ? tx.amount : -tx.amount)} />))}
    </tbody>
  </table>
  );
};

export default TransactionTable;
