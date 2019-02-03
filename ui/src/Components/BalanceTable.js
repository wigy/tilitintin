import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BalanceLine from './BalanceLine';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import BalanceModel from '../Models/BalanceModel';

@inject('store')
@inject('cursor')
@observer
class BalanceTable extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Balances');
  }

  render() {

    return (
      <table className="BalanceTable">
        <tbody>
          {this.props.balances.map((balance, idx) => {
            return (<BalanceLine key={balance.account_id} index={idx} balance={balance} />);
          })}
        </tbody>
      </table>
    );
  }
}

BalanceTable.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor),
  balances: PropTypes.arrayOf(PropTypes.instanceOf(BalanceModel))
};

export default BalanceTable;
