import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';
import Money from './Money';
import TextEdit from './TextEdit';
import './TransactionDetails.css';

export default translate('translations')(inject('store')(observer(class TransactionDetails extends Component {

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
      case 'account':
        url = '/' + this.props.tx.db + '/txs/' + this.props.tx.period_id + '/' + this.props.entry.account_id;
        text = <Link to={url}>{this.props.entry.number} {this.props.entry.name}</Link>;
        break;
      case 'description':
        text = this.props.entry.description.replace(/^(\[[A-Z-a-z0-9]+\])+\s*/, '');
        break;
      default:
        text = ' ';
    }

    // A function called after editing is finished.
    const onComplete = (value) => {

      let entry = {id: this.props.entry.id};

      switch(this.props.type) {
        case 'debit':
          break;
        case 'credit':
          break;
        case 'account':
          break;
        case 'description':
          let tags = this.props.store.sortTags(this.props.tx.tags).map(tag => '[' + tag.tag + ']').join('');
          if (tags) {
            tags += ' ';
          }
          this.props.entry.description = tags + value;
          entry.description = this.props.entry.description;
          break;
        default:
      }

      return this.props.store.saveEntry(entry)
        .then((res) => {
          this.props.store.selected.editor = null;
        });
    }

    // Show editor instead, if it is turned on.
    if (this.props.selected && this.props.store.selected.editor) {
      return (<TextEdit
        value={text}
        validate={(text) => !text ? <Trans>This field is required.</Trans> : null}
        onComplete={value => onComplete(value)}
      />);
    }

    const className = 'TransactionDetails ' + (this.props.current ? ' current' : '') + (this.props.selected ? ' selected' : '');
    return (
      <div className={className}>{text}</div>
    );
  };
})));
