import React from 'react';
import Money from './Money';
import YYYYMMDD from './YYYYMMDD';
import './Transaction.css';

const Transaction = (props) => {
  const money = (<Money cents={props.tx.amount} currency="EUR" />);
  const total = (<Money cents={props.total} currency="EUR" />);

  return (<tr className="Transaction">
    <td className="number">{props.tx.number}</td>
    <td className="date"><YYYYMMDD date={props.tx.date}/></td>
    <td className="description">{props.tx.description}</td>
    <td className="debit">{props.tx.debit ? money : ''}</td>
    <td className="credit">{props.tx.debit ? '' : money}</td>
    <td className="total">{total}</td>
    </tr>
  );
};

export default Transaction;
