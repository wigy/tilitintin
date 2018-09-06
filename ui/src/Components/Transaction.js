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

    let ret = [
      <tr id={'Transaction' + this.props.tx.id} key="title" className={'Transaction' + (this.props.selected ? ' selected' : '') + (this.props.tx.open ? ' open' : '') + (this.props.duplicate ? ' duplicate' : '')} onClick={onClick}>
        <td className="number">{this.props.tx.number}</td>
        <td className="date"><YYYYMMDD date={this.props.tx.date}/></td>
        <td className="tags" style={{width: (this.props.tx.tags.length) * 2.6 + 'ex'}}><Tags tags={this.props.tx.tags}/></td>
        <td className="description">
          <span className="summary">{this.props.tx.description}&nbsp;</span>
        </td>
        <td className="debit">
          <span className="summary">&nbsp;{this.props.tx.debit ? money : ''}</span>
        </td>
        <td className="credit">
          <span className="summary">&nbsp;{this.props.tx.debit ? '' : money}</span>
        </td>
        <td className="total">{total}</td>
      </tr>
    ];

    this.props.tx.entries.forEach((entry, idx) => {
      const isSelected = (type) => this.props.selected && selectedColumn === type && idx === selectedRow;
      const current = this.props.tx.account_id === entry.account_id;
      ret.push(
      <tr key={idx} className={'TransactionEntry' + (this.props.tx.open ? ' open' : '') + (this.props.duplicate ? ' duplicate' : '')} onClick={onClick}>
        <td className="accountNumber">
          <TransactionDetails selected={isSelected('accountNumber')} current={current} type="accountNumber" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="accountName">
          <TransactionDetails selected={isSelected('accountName')} current={current} type="accountName" tx={this.props.tx} entry={entry}/>
        </td>
        <td></td>
        <td className="description">
          <TransactionDetails selected={isSelected('description')} current={current} type="description" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="debit">
          <TransactionDetails selected={isSelected('debit')} current={current} type="debit" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="credit">
          <TransactionDetails selected={isSelected('credit')} current={current} type="credit" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="total">
        </td>
      </tr>);
    });
    return ret;
  }
}))
