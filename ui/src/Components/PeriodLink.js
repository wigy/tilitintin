import React from 'react';
import { Link } from 'react-router-dom';
import YYYYMMDD from './YYYYMMDD';

const PeriodLink = (props) => {
  const dst = '/' + props.db + '/period/' + props.period.id;
  return (<Link to={dst}>
    <YYYYMMDD date={props.period.start_date} /> <YYYYMMDD date={props.period.end_date} />
  </Link>);
};

export default PeriodLink;
