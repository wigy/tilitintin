import React from 'react';
import { Link } from 'react-router-dom';
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
        const desc = entry.description.replace(/^(\[[A-Z-a-z0-9]+\])+\s*/, '');
        const url = '/' + props.tx.db + '/txs/' + props.tx.period_id + '/' + entry.account_id;
        return (
          <Link to={url}>
            {entry.number + ' ' + entry.name + (desc && props.tx.description !== desc ? ' - (' + desc  + ')': '')}
          </Link>
        );
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
