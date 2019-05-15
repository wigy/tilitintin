import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AccountModel from '../Models/AccountModel';

const AccountLink = (props) => {
  const dst = '/' + props.db + '/account/' + props.period + '/' + props.account.id;
  const fav = props.account.FAVORITE;
  // TODO: Slow DOM. Use colors.
  return (<>
    <span>{fav ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>} </span>
    <Link to={dst}>{props.account.toString()}</Link>
    </>);
};

AccountLink.propTypes = {
  account: PropTypes.instanceOf(AccountModel),
  db: PropTypes.string,
  period: PropTypes.number
};

export default AccountLink;
