import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {account: {}};
  }

  componentDidMount() {
    this.props.store.getAccountPeriod(this.props.match.params.id, this.props.match.params.period)
      .then(account => this.setState({account: account}));
  }

  render() {
    return (
      <div className="Account">
        <h1>Account</h1>
        </div>
    );
  }
}));
