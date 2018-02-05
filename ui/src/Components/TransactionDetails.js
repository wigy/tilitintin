import React from 'react';
import Money from './Money';
import './TransactionDetails.css';

const TransactionDetails = (props) => {
  let text;

  switch(props.type) {
    case 'debit':
      text = (entry) => entry.debit ? (<Money cents={entry.amount} currency="EUR" />) : (<span className="filler">-</span>);
      break;
    case 'credit':
      text = (entry) => !entry.debit ? (<Money cents={entry.amount} currency="EUR" />) : (<span className="filler">-</span>);
      break;
    case 'description':
      text = (entry) => {
        let desc = entry.description.replace(/^(\[[A-Z-a-z0-9]+\])+\s*/, '');
        return entry.number + ' ' + entry.name + (props.tx.description !== desc ? ' - (' + desc  + ')': '');
      }
      break;
    default:
      text = () => {};
  }

  return (
    <div className="TransactionDetails">
      {props.tx.entries.map((entry) => {
        return (<div key={entry.id} className={'line' + (props.current === entry.account_id ? ' current' : '')}>
          {text(entry)}
        </div>);
      })}
    </div>
  );
};

export default TransactionDetails;
