import React from 'react';

const Transaction = (props) => {
  // TODO: Use Money component to format.
  // TODO: Use Date component.
  return (<tr className="Transaction">
    <td>{props.tx.number}</td>
    <td>{props.tx.date}</td>
    <td>{props.tx.description}</td>
    <td>{props.tx.debet}</td>
    <td>{props.tx.debit ? props.tx.amount/100 : ''}</td>
    <td>{props.tx.debit ? '' : props.tx.amount/100}</td>
    </tr>
  );
};

export default Transaction;
