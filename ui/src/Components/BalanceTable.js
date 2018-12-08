import React, { Component } from 'react';
import BalanceLine from './BalanceLine';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class BalanceTable extends Component {

  componentDidMount() {
    this.props.store.cursor.selectPage('Balances');
  }

  render() {

    const { component, index } = this.props.store.cursor;

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
}

export default BalanceTable;
