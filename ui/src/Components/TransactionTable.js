import React from 'react';
import Transaction from './Transaction';

const TransactionTable = (props) => {
  let sum = 0;
  return (<table className="TransactionTable">
    <tbody>
    {props.txs.map((tx, idx) => (<Transaction key={idx} tx={tx} total={sum+=(tx.debit ? tx.amount : -tx.amount)} />))}
    </tbody>
  </table>
  );
};

export default TransactionTable;
