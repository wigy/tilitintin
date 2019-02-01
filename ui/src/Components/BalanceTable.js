import React, { Component } from 'react';
import PropTypes, { object } from 'prop-types';
import BalanceLine from './BalanceLine';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@inject('store')
@inject('cursor')
@observer
class BalanceTable extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Balances');
  }

  render() {

    const { component, index } = this.props.cursor;

    return (
      <table className="BalanceTable">
        <tbody>
          {this.props.balances.map((balance, idx) => {
            return (<BalanceLine selected={component === 'BalanceTable' && index === idx} key={balance.account_id} index={idx} db={this.props.db} periodId={this.props.periodId} balance={balance} />);
          })}
        </tbody>
      </table>
    );
  }
}

BalanceTable.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor),
  db: PropTypes.string,
  balances: PropTypes.arrayOf(object),
  periodId: PropTypes.number
};

export default BalanceTable;
