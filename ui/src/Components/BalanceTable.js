import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import BalanceModel from '../Models/BalanceModel';
import { action } from 'mobx';
import { Link } from 'react-router-dom';
import Cursor from '../Stores/Cursor';
import Money from './Money';

@inject('cursor')
@observer
class BalanceLine extends Component {

  // Move to the clicked balance line.
  @action.bound
  onClick() {
    this.props.cursor.setComponent('Balances.balances');
    this.props.cursor.setIndex(this.props.index, { noScroll: true });
  }

  render() {
    const { balance } = this.props;
    const dst = balance.getUrl();
    return (
      <tr id={balance.getId()} className={balance.getClasses()}>
        <td className="number"><Link onClick={() => this.onClick()} to={dst}>{balance.account && balance.account.number}</Link></td>
        <td className="name"><Link onClick={() => this.onClick()} to={dst}>{balance.account && balance.account.name}</Link></td>
        <td className="balance"><Link onClick={() => this.onClick()} to={dst}><Money cents={balance.total} currency="EUR"/></Link></td>
      </tr>
    );
  }
}

BalanceLine.propTypes = {
  balance: PropTypes.instanceOf(BalanceModel),
  cursor: PropTypes.instanceOf(Cursor),
  index: PropTypes.number
};

@observer
class BalanceTable extends Component {

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
  balances: PropTypes.arrayOf(PropTypes.instanceOf(BalanceModel))
};

export default BalanceTable;
