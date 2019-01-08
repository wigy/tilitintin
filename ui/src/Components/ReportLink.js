import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';

const ReportLink = (props) => {
  const dst = '/' + props.db + '/report/' + props.periodId + '/' + (props.accountId || 'none') + '/' + props.format;
  return (<Link to={dst}>
    <Trans>{props.format}</Trans>
  </Link>);
};

ReportLink.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.number,
  accountId: PropTypes.number,
  format: PropTypes.string
};

export default ReportLink;
