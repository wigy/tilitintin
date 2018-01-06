import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import BalanceLine from '../Components/BalanceLine';

// TODO: Rename this as Balances
export default inject('store')(observer(class Period extends Component {

  render() {
    const {db, id} = this.props.match.params;
    let balances = this.props.store.balances[db];
    if (!balances || !balances[id]) {
      return '';
    }
    balances = Object.values(balances[id]);
    const period = this.props.store.periods[db][id];
    return (
      <div className="Period">
        <h1>Period</h1>
        {balances.map(balance => (<BalanceLine period={period} key={balance.id} line={balance} />))}
      </div>
    );
  }
}));
