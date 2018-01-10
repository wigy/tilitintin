import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import TransactionTable from '../Components/TransactionTable';

export default inject('store')(observer(class Account extends Component {

  update(params) {
    const {db, periodId, accountId} = params;
    this.props.store.getAccountPeriod(db, accountId, periodId);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  // TODO: Rename this as AccountTransactions
  render() {

    return (
      <div className="Account">
        <h1>{this.props.store.title}</h1>
        <TransactionTable txs={this.props.store.transactions} />
        </div>
    );
  }
}));
