import React, { Component } from 'react';
import BalanceLine from './BalanceLine';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class BalanceTable extends Component {
  render() {

    const { component, index } = this.props.store.selected;

    return (
      <table className="BalanceTable">
        <tbody>
          {this.props.balances.map((balance, idx) => {
            return (<BalanceLine selected={component === 'BalanceTable' && index === idx} key={balance.id} db={this.props.db} periodId={this.props.periodId} line={balance} />);
          })}
        </tbody>
      </table>
    );
  }
}));
