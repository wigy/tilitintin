import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import TextEdit from './TextEdit';
import Store from '../Stores/Store';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import Cursor from '../Stores/Cursor';

import './TransactionDetails.css';

@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class TransactionDetails extends Component {

  render() {
    const target = this.props.field === 'date' ? this.props.document : this.props.entry;

    if ((this.props.document.edit && this.props.field === 'date') ||
      (this.props.entry && this.props.entry.edit && this.props.entry.column === this.props.field)) {

      return (<TextEdit
        value={target.getEdit(this.props.field)}
        target={target}
        validate={value => target.validate(this.props.field, value)}
        proposal={value => target.proposal(this.props.field, value)}
        onComplete={(value, proposal) => target.change(this.props.field, value)
          .then(() => target.save())
          .then(() => target.store.fetchBalances())
          .then(() => target.turnEditorOff(this.props.cursor))
          .then(() => this.props.onComplete && this.props.onComplete(target, proposal))}
        onCancel={() => target.turnEditorOff(this.props.cursor)}
      />);
    }

    const column = this.props.entry ? this.props.entry.columns().indexOf(this.props.field) : null;
    const className = 'TransactionDetails ' +
      target.getClasses(column, this.props.cursor.row) +
      (this.props.error ? ' error' : '') +
      (this.props.classNames ? ' ' + this.props.classNames : '');

    return (
      <div className={className}>{target.getView(this.props.field)}&nbsp;</div>
    );
  }
}

TransactionDetails.propTypes = {
  document: PropTypes.instanceOf(DocumentModel),
  entry: PropTypes.instanceOf(EntryModel),
  index: PropTypes.number,
  field: PropTypes.string,
  classNames: PropTypes.string,
  error: PropTypes.bool,
  onComplete: PropTypes.func,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default TransactionDetails;
