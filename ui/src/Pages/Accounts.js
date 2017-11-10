import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountLink from '../Components/AccountLink';

export default inject('store')(observer(class Accounts extends Component {
  render() {
    // TODO: Headings from coa_heading table.
    return (
      <div className="Accounts">
        <h1>Accounts</h1>
        {this.props.store.accounts.map(account => (<div><AccountLink key={account.id} account={account}/></div>))}
      </div>
    );
  }
}));

