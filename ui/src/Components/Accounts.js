import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountLink from '../Components/AccountLink';

export default inject('store')(observer(class Accounts extends Component {

  constructor(props) {
    super(props);
    this.state = {accounts: []};
  }

  componentDidMount() {
    this.props.store.getAccounts(this.props.match.params.db)
      .then(accounts => this.setState({accounts: accounts}));
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    // TODO: Headings from coa_heading table.
    return (
      <div className="Accounts">
        <h1>Tilit</h1>
        {this.state.accounts.map(account => (<div key={account.id}><AccountLink key={account.id} account={account}/></div>))}
      </div>
    );
  }
}));

