import React from 'react';
import { Link } from 'react-router-dom';
import YYYYMMSS from './YYYYMMSS';

const PeriodLink = (props) => {
  const dst = '/period/' + props.period.id;
  return (<Link to={dst}>
    <YYYYMMSS date={props.period.start_date} /> <YYYYMMSS date={props.period.end_date} />
  </Link>);
};

export default PeriodLink;
