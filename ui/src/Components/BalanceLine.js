import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import Money from './Money';
import Cursor from '../Stores/Cursor';
import BalanceModel from '../Models/BalanceModel';

import './BalanceLine.css';

@inject('cursor')
class BalanceLine extends Component {
  render() {
    const {db, periodId, balance, selected} = this.props;
    const dst = '/' + db + '/txs/' + periodId + '/' + balance.account_id;

    return (
      <tr id={'Balance' + balance.account_id} className={selected ? 'BalanceLine selected' : 'BalanceLine'}>
        <td className="number"><Link to={dst}>{balance.account && balance.account.number}</Link></td>
        <td className="name"><Link to={dst}>{balance.account && balance.account.name}</Link></td>
        <td className="balance"><Link to={dst}><Money cents={balance.total} currency="EUR"/></Link></td>
      </tr>
    );
  }
}

BalanceLine.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  db: PropTypes.string,
  periodId: PropTypes.number,
  index: PropTypes.number,
  balance: PropTypes.instanceOf(BalanceModel),
  selected: PropTypes.bool
};

export default BalanceLine;
