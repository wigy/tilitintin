import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Transaction from '../Components/Transaction';

export default inject('store')(observer(class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {account: {transactions: []}};
  }

  componentDidMount() {
    const {db, id, period} = this.props.match.params;
    this.props.store.getAccountPeriod(db, id, period)
      .then(account => this.setState({account: account}));
  }

  render() {
    // TODO: Move table to TransactionList component.
    return (
      <div className="Account">
        <h1>Account</h1>
        <h2>{this.state.account.number} {this.state.account.name}</h2>
        <table>
          <tbody>
            {this.state.account.transactions.map((tx) => (<Transaction key={tx.id} tx={tx} />))}
          </tbody>
        </table>
        </div>
    );
  }
}));
