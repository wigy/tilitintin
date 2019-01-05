import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const AccountLink = (props) => {
  const dst = '/' + props.account.db + '/account/' + props.period + '/' + props.account.id;
  return (<Link to={dst}>
    {props.account.number} {props.account.name}
  </Link>);
};

AccountLink.propTypes = {
  account: PropTypes.object,
  period: PropTypes.number
};

export default AccountLink;
