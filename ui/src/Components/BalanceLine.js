import React from 'react';
import { Link } from 'react-router-dom';
import Money from './Money';
import './BalanceLine.css';

const BalanceLine = (props) => {
  const dst = '/' + props.db + '/txs/' + props.periodId + '/' + props.line.id;
  return (
    <tr id={'Balance' + props.line.id} className={props.selected ? 'BalanceLine selected' : 'BalanceLine'}>
      <td className="number"><Link to={dst}>{props.line.number}</Link></td>
      <td className="name"><Link to={dst}>{props.line.name}</Link></td>
      <td className="balance"><Link to={dst}><Money cents={props.line.total} currency="EUR"/></Link></td>
    </tr>
  );
};

export default BalanceLine;
