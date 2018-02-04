import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import TransactionTable from '../Components/TransactionTable';

export default inject('store')(observer(class Account extends Component {

  update({db, periodId, accountId}) {
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
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="Account">
        <TransactionTable txs={this.props.store.transactions} />
        </div>
    );
  }
}));
