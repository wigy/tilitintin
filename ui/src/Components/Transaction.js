import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Money from './Money';
import YYYYMMDD from './YYYYMMDD';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import './Transaction.css';

export default inject('store')(observer(class Transaction extends Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  componentWillReceiveProps(props) {
    this.setState({open: false});
  }

  render() {
    const money = (<Money cents={this.props.tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    const onClick = () => {
      this.setState({open: !this.state.open});
    };

    return (
      <tr className={'Transaction' + (this.state.open ? ' open' : '') + (this.props.duplicate ? ' duplicate' : '')} onClick={onClick}>
        <td className="number">{this.props.tx.number}</td>
        <td className="date"><YYYYMMDD date={this.props.tx.date}/></td>
        <td className="tags" style={{width: (this.props.tx.tags.length) * 2.6 + 'ex'}}><Tags tags={this.props.tx.tags}/></td>
        <td className="description">
          <span className="summary">{this.props.tx.description}</span>
          {this.state.open ? (
            <TransactionDetails type="description" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="debit">
          <span className="summary">&nbsp;{this.props.tx.debit ? money : ''}</span>
          {this.state.open ? (
            <TransactionDetails type="debit" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="credit">
          <span className="summary">&nbsp;{this.props.tx.debit ? '' : money}</span>
          {this.state.open ? (
            <TransactionDetails type="credit" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="total">{total}</td>
      </tr>
    );
  }
}))
