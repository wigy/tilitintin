import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import TransactionTable from '../Components/TransactionTable';

 @inject('store')
 @observer
 class AccountTransactions extends Component {

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="AccountTransactions">
        <TransactionTable/>
      </div>
    );
  }
}

export default AccountTransactions;
