import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import Money from './Money';
import Cursor from '../Stores/Cursor';
import './BalanceLine.css';

@inject('cursor')
class BalanceLine extends Component {
  render() {
    const props = this.props;
    const dst = '/' + props.db + '/txs/' + props.periodId + '/' + props.line.id;

    const onClick = () => {
      this.props.cursor.selectIndex('BalanceTable', props.index);
    };

    return (
      <tr id={'Balance' + props.line.id} className={props.selected ? 'BalanceLine selected' : 'BalanceLine'}>
        <td className="number"><Link onClick={onClick} to={dst}>{props.line.number}</Link></td>
        <td className="name"><Link onClick={onClick} to={dst}>{props.line.name}</Link></td>
        <td className="balance"><Link onClick={onClick} to={dst}><Money cents={props.line.total} currency="EUR"/></Link></td>
      </tr>
    );
  }
}

BalanceLine.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  db: PropTypes.string,
  periodId: PropTypes.number,
  line: PropTypes.object,
  selected: PropTypes.bool
};

export default BalanceLine;
