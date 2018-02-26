import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import BalanceTable from '../Components/BalanceTable';

export default inject('store')(observer(class Balances extends Component {

  // TODO: i18n
  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db, periodId} = this.props.match.params;
    let balances = this.props.store.balances;
    return (
      <div className="Period">
        <h1>Tilien saldot</h1>
        <BalanceTable db={db} periodId={periodId} balances={balances}/>
      </div>
    );
  }
}));
