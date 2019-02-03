import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import Money from './Money';
import BalanceModel from '../Models/BalanceModel';

import './BalanceLine.css';

@observer
class BalanceLine extends Component {
  render() {
    const { balance } = this.props;
    const dst = balance.getUrl();
    return (
      <tr id={balance.getId()} className={balance.getClasses()}>
        <td className="number"><Link to={dst}>{balance.account && balance.account.number}</Link></td>
        <td className="name"><Link to={dst}>{balance.account && balance.account.name}</Link></td>
        <td className="balance"><Link to={dst}><Money cents={balance.total} currency="EUR"/></Link></td>
      </tr>
    );
  }
}

BalanceLine.propTypes = {
  balance: PropTypes.instanceOf(BalanceModel)
};

export default BalanceLine;
