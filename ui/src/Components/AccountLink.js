import React from 'react';
import { Link } from 'react-router-dom';

const AccountLink = (props) => {
  return (<Link to={props.account.links.view}>
    {props.account.number} {props.account.name}
  </Link>);
};

export default AccountLink;
