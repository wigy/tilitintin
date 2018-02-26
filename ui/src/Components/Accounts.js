import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountTable from '../Components/AccountTable';

export default inject('store')(observer(class Accounts extends Component {

  // TODO: i18n
  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="Accounts">
        <h1>Tilikartta</h1>
        <AccountTable accounts={this.props.store.accounts} headings={this.props.store.headings} />
      </div>
    );
  }
}));

