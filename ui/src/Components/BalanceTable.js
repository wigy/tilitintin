import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BalanceLine from './BalanceLine';
import { observer } from 'mobx-react';
import BalanceModel from '../Models/BalanceModel';

@observer
class BalanceTable extends Component {

  render() {

    return (
      <table className="BalanceTable">
        <tbody>
          {this.props.balances.map((balance) => {
            return (<BalanceLine key={balance.account_id} balance={balance} />);
          })}
        </tbody>
      </table>
    );
  }
}

BalanceTable.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.instanceOf(BalanceModel))
};

export default BalanceTable;
