import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import AccountTable from '../Components/AccountTable';

export default translate('translations')(inject('store')(observer(class Accounts extends Component {

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="Accounts">
        <h1><Trans>Account scheme</Trans></h1>
        <AccountTable accounts={this.props.store.accounts} headings={this.props.store.headings} />
      </div>
    );
  }
})));

