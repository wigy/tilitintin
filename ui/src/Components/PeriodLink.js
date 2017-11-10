import React from 'react';
import { Link } from 'react-router-dom';
import YYYYMMSS from './YYYYMMSS';

const PeriodLink = (props) => {
  return (<Link to={props.period.links.view}>
    <YYYYMMSS date={props.period.start_date} /> <YYYYMMSS date={props.period.end_date} />
  </Link>);
};

export default PeriodLink;
