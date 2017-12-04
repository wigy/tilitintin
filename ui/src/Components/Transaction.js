import React from 'react';
import Money from './Money';

const Transaction = (props) => {
  // TODO: Use Date component (also show in current time zone).
  const money = (<Money cents={props.tx.amount} currency="EUR" />);

  return (<tr className="Transaction">
    <td>{props.tx.number}</td>
    <td>{props.tx.date}</td>
    <td>{props.tx.description}</td>
    <td>{props.tx.debet}</td>
    <td>{props.tx.debit ? money : ''}</td>
    <td>{props.tx.debit ? '' : money}</td>
    </tr>
  );
};

export default Transaction;
