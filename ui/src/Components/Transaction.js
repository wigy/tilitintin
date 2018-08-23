import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Money from './Money';
import YYYYMMDD from './YYYYMMDD';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import './Transaction.css';

export default inject('store')(observer(class Transaction extends Component {

  render() {
    const money = (<Money cents={this.props.tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    const onClick = () => {
      this.props.tx.open = !this.props.tx.open;
    };

    const {selectedColumn, selectedRow} = this.props;

    // TODO: Redesign this layout so that we have separate rows for TransactionDetails.
    // TODO: Move account name to own column in opened format and add description always.
    return (
      <tr id={'Transaction' + this.props.tx.id} className={'Transaction' + (this.props.selected ? ' selected' : '') + (this.props.tx.open ? ' open' : '') + (this.props.duplicate ? ' duplicate' : '')} onClick={onClick}>
        <td className="number">{this.props.tx.number}</td>
        <td className="date"><YYYYMMDD date={this.props.tx.date}/></td>
        <td className="tags" style={{width: (this.props.tx.tags.length) * 2.6 + 'ex'}}><Tags tags={this.props.tx.tags}/></td>
        <td className="description">
          <span className="summary">{this.props.tx.description}&nbsp;</span>
          {this.props.tx.open ? (
            <TransactionDetails selectedRow={selectedColumn==='description' ? selectedRow : null} type="description" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="debit">
          <span className="summary">&nbsp;{this.props.tx.debit ? money : ''}</span>
          {this.props.tx.open ? (
            <TransactionDetails selectedRow={selectedColumn==='debit' ? selectedRow : null} type="debit" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="credit">
          <span className="summary">&nbsp;{this.props.tx.debit ? '' : money}</span>
          {this.props.tx.open ? (
            <TransactionDetails selectedRow={selectedColumn==='credit' ? selectedRow : null} type="credit" current={this.props.tx.account_id} tx={this.props.tx} />
          ) : ''}
        </td>
        <td className="total">{total}</td>
      </tr>
    );
  }
}))
