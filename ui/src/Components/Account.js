import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import './Account.css';

@translate('translations')
@inject('store')
@observer
class Account extends Component {

  componentDidMount() {
    const {db, periodId, accountId} = this.props.match.params;
    this.props.store.setAccount(db, periodId, accountId);
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const account = this.props.store.account;
    if (!account) {
      return '';
    }
    return (
      <div className="Account">
        <h1><Trans>Account</Trans></h1>
        <div className="summary">
          <Trans>Account Name</Trans>: {account.name}<br/>
          <Trans>Account Number</Trans>: {account.number}<br/>
          <Trans>Account Type</Trans>: <Trans>{account.type}</Trans><br/>
        </div>
      </div>
    );
  }
}

Account.propTypes = {
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};

export default Account;
