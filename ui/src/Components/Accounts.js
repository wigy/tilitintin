import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import AccountTable from '../Components/AccountTable';

@translate('translations')
@inject('store')
@observer
class Accounts extends Component {

  componentDidMount() {
    this.props.store.cursor.selectPage('Accounts');
  }

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
}

export default Accounts;
