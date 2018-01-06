import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import TransactionTable from '../Components/TransactionTable';

export default inject('store')(observer(class Account extends Component {

  render() {
    const {db, id, period} = this.props.match.params;
    if (!this.props.store.accounts[db] || !this.props.store.accounts[db][period] || !this.props.store.accounts[db][period][id]) {
      return '';
    }
    const account = this.props.store.accounts[db][period][id];
    return (
      <div className="Account">
        <h1>Account</h1>
        <h2>{account.number} {account.name}</h2>
        <TransactionTable txs={account.transactions} />
        </div>
    );
  }
}));
