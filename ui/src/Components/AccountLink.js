import React from 'react';
import { Link } from 'react-router-dom';

const AccountLink = (props) => {
  const dst = '/account/' + props.account.id;
  return (<Link to={dst}>
    {props.account.number} {props.account.name}
  </Link>);
};

export default AccountLink;
