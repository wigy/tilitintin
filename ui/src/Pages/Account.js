import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {account: {}};
  }

  componentDidMount() {
    const {db, id, period} = this.props.match.params;
    this.props.store.getAccountPeriod(db, id, period)
      .then(account => this.setState({account: account}));
  }

  render() {
    return (
      <div className="Account">
        <h1>Account</h1>
        <h2>{this.state.account.number} {this.state.account.name}</h2>
        </div>
    );
  }
}));
