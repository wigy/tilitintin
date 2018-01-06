import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import BalanceLine from '../Components/BalanceLine';

// TODO: Rename this as Balances
export default inject('store')(observer(class Period extends Component {

  render() {
    let balances = this.props.store.balances[this.props.match.params.db];
    if (!balances || !balances[this.props.match.params.id]) {
      return '';
    }
    balances = Object.values(balances[this.props.match.params.id]);
    const period = this.props.store.periods[this.props.match.params.db][this.props.match.params.id];
    return (
      <div className="Period">
        {balances.map(balance => (<BalanceLine period={period} key={balance.id} line={balance} />))}
      </div>
    );
  }
}));
