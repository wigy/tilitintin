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
        <th className="date">Päiväys</th>
        <th className="tags"></th>
        <th className="description">Kuvaus</th>
        <th className="debit">Debet</th>
        <th className="credit">Kredit</th>
        <th className="total">Yhteensä</th>
      </tr>
    </thead>
    <tbody>
    {props.txs.map((tx, idx) => (<Transaction key={idx} tx={tx} total={sum+=(tx.debit ? tx.amount : -tx.amount)} />))}
    </tbody>
  </table>
  );
};

export default TransactionTable;
