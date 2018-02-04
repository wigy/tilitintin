import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import BalanceTable from '../Components/BalanceTable';

// TODO: Rename this as Balances
export default inject('store')(observer(class Period extends Component {

  componentDidMount() {
    const {db, periodId} = this.props.match.params;
    this.props.store.getBalances(db, periodId);
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db, periodId} = this.props.match.params;
    let balances = this.props.store.balances;
    return (
      <div className="Period">
        <h1>Tilit</h1>
        <BalanceTable db={db} periodId={periodId} balances={balances}/>
      </div>
    );
  }
}));
