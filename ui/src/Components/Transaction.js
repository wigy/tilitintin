import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Money from './Money';
import YYYYMMDD from './YYYYMMDD';
import Tags from './Tags';
import TransactionDetails from './TransactionDetails';
import './Transaction.css';

export default translate('translations')(inject('store')(observer(class Transaction extends Component {

  render() {

    // Calculate imbalance
    let debit = 0;
    let credit = 0;
    this.props.tx.entries.forEach((entry, idx) => {
      if (entry.debit) {
        debit += entry.amount;
      } else {
        credit += entry.amount;
      }
    });
    const smaller = Math.min(debit, credit);
    debit -= smaller;
    credit -= smaller;
    const imbalance = (credit !== debit);

    // Render top row.
    const money = (<Money cents={this.props.tx.amount} currency="EUR" />);
    const total = (<Money cents={this.props.total} currency="EUR" />);

    const onClick = () => {
      this.props.tx.open = !this.props.tx.open;
    };

    const {selectedColumn, selectedRow} = this.props;
    const classes = 'Transaction'
      + (this.props.selected ? ' selected' : '')
      + (this.props.tx.open ? ' open' : '')
      + (imbalance ? ' imbalance' : '')
      + (this.props.duplicate ? ' duplicate' : '');

    let ret = [
      <tr id={'Transaction' + this.props.tx.id} key="title" className={classes} onClick={onClick}>
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

    // Render entries.
    this.props.tx.entries.forEach((entry, idx) => {
      const isSelected = (type) => this.props.selected && selectedColumn === type && idx === selectedRow;
      const current = this.props.tx.account_id === entry.account_id;
      ret.push(
      <tr key={idx} className={'alt TransactionEntry' + (this.props.tx.open ? ' open' : '') + (this.props.duplicate ? ' duplicate' : '')} onClick={onClick}>
        <td className="account" colSpan={3}>
          <TransactionDetails selected={isSelected('account')} current={current} type="account" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="description">
          <TransactionDetails selected={isSelected('description')} current={current} type="description" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="debit">
          <TransactionDetails selected={isSelected('debit')} current={current} type="debit" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="credit">
          <TransactionDetails selected={isSelected('credit')} current={current} type="credit" tx={this.props.tx} entry={entry}/>
        </td>
        <td className="empty">
        </td>
      </tr>);
    });

    // Render imbalance
    if (imbalance) {
      ret.push(
        <tr key="imbalance" className={'alt imbalance TransactionEntry' + (this.props.tx.open ? ' open' : '')} onClick={onClick}>
        <td className="account" colSpan={3}></td>
        <td className="description">
          <Trans>Debit and credit do not match</Trans>
        </td>
        <td className="debit">
          {credit ? <Money cents={credit} currency="€"/> : ''}
        </td>
        <td className="credit">
          {debit ? <Money cents={debit} currency="€"/> : ''}
        </td>
        <td className="empty"></td>
      </tr>);
    }

    return ret;
  }
})));
