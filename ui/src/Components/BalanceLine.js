import React from 'react';
import { Link } from 'react-router-dom';

const BalanceLine = (props) => {
  // TODO: Use Money component to format.
  const dst = '/' + props.period.db + '/account/' + props.line.id + '/' + props.period.id;
  return (<div className="BalanceLine">
    <Link to={dst}>{props.line.number} {props.line.name} {props.line.total/100}€</Link>
  </div>
  );
};

export default BalanceLine;
