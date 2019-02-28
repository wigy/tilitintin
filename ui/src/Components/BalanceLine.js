import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import Money from './Money';
import BalanceModel from '../Models/BalanceModel';
import Cursor from '../Stores/Cursor';

import './BalanceLine.css';

@inject('cursor')
@observer
class BalanceLine extends Component {

  // Move to the clicked balance line.
  @action.bound
  onClick() {
    this.props.cursor.setComponent('Balances.balances');
    this.props.cursor.setIndex(this.props.index, {noScroll: true});
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

export default BalanceLine;
