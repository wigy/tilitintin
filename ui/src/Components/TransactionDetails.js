import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import Money from './Money';
import TextEdit from './TextEdit';
import './TransactionDetails.css';

export default inject('store')(observer(class TransactionDetails extends Component {

  render() {
    let text;
    let url;

    switch(this.props.type) {
      case 'debit':
        text = this.props.entry.debit ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        break;
      case 'credit':
        text = !this.props.entry.debit ? (<Money cents={this.props.entry.amount} currency="EUR" />) : <span className="filler">-</span>;
        break;
      case 'accountNumber':
        url = '/' + this.props.tx.db + '/txs/' + this.props.tx.period_id + '/' + this.props.entry.account_id;
        text = <Link to={url} title={this.props.entry.name}>{this.props.entry.number}</Link>;
        break;
      case 'accountName':
        url = '/' + this.props.tx.db + '/txs/' + this.props.tx.period_id + '/' + this.props.entry.account_id;
        text = <Link to={url} title={this.props.entry.name}>{this.props.entry.name}</Link>;
        break;
      case 'description':
        text = this.props.entry.description.replace(/^(\[[A-Z-a-z0-9]+\])+\s*/, '');
        break;
      default:
        text = '';
    }

    // Show editor instead, if it is turned on.
    if (this.props.selected && this.props.store.selected.editor) {
      return (<TextEdit value={text} onComplete={value => console.log(value)}></TextEdit>)
    }

    const className = 'TransactionDetails ' + (this.props.current ? ' current' : '') + (this.props.selected ? ' selected' : '');
    return (
      <div className={className}>
        {text}
      </div>
    );
  };
}));
