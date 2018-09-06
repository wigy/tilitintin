import React from 'react';
import { Link } from 'react-router-dom';
import Money from './Money';
import './TransactionDetails.css';

const TransactionDetails = (props) => {
  let text;
  let url;

  switch(props.type) {
    case 'debit':
      text = props.entry.debit ? (<Money cents={props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
      break;
    case 'credit':
      text = !props.entry.debit ? (<Money cents={props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
      break;
    case 'accountNumber':
      url = '/' + props.tx.db + '/txs/' + props.tx.period_id + '/' + props.entry.account_id;
      text = <Link to={url} title={props.entry.name}>{props.entry.number}</Link>;
      break;
    case 'accountName':
      url = '/' + props.tx.db + '/txs/' + props.tx.period_id + '/' + props.entry.account_id;
      text = <Link to={url} title={props.entry.name}>{props.entry.name}</Link>;
      break;
    case 'description':
      text = props.entry.description.replace(/^(\[[A-Z-a-z0-9]+\])+\s*/, '');
      break;
    default:
      text = '';
  }

  const className = 'TransactionDetails ' + (props.current ? ' current' : '') + (props.selected ? ' selected' : '');
  return (
    <div className={className}>
      {text}
    </div>
  );
};

export default TransactionDetails;
