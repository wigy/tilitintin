import React from 'react';
import { Link } from 'react-router-dom';
import Money from './Money';

const BalanceLine = (props) => {
  const dst = '/' + props.period.db + '/period/' + props.period.id + '/' + props.line.id;
  return (<div className="BalanceLine">
    <Link to={dst}>{props.line.number} {props.line.name} <Money cents={props.line.total} currency="EUR"/></Link>
  </div>
  );
};

export default BalanceLine;
