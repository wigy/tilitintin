import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import TransactionTable from '../Components/TransactionTable';

export default inject('store')(observer(class AccountTransactions extends Component {

  update({db, periodId, accountId}) {
    this.props.store.getAccountPeriod(db, accountId, periodId);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="AccountTransactions">
        <TransactionTable txs={this.props.store.transactions} />
      </div>
    );
  }
}));
