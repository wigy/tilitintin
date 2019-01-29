import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AccountModel from '../Models/AccountModel';

const AccountLink = (props) => {
  const dst = '/' + props.db + '/account/' + props.period + '/' + props.account.id;
  return (<Link to={dst}>{props.account.toString()}</Link>);
};

AccountLink.propTypes = {
  account: PropTypes.instanceOf(AccountModel),
  db: PropTypes.string,
  period: PropTypes.number
};

export default AccountLink;
