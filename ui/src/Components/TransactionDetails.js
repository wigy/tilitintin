import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate } from 'react-i18next';
import TextEdit from './TextEdit';
import Store from '../Stores/Store';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import Cursor from '../Stores/Cursor';

import './TransactionDetails.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class TransactionDetails extends Component {

  render() {
    let target = this.props.field === 'date' ? this.props.document : this.props.entry;

    if ((this.props.document.edit && this.props.field === 'date') ||
      (this.props.entry && this.props.entry.edit && this.props.entry.column === this.props.field)) {

      return (<TextEdit
        value={target.getEdit(this.props.field)}
        target={target}
        validate={value => target.validate(this.props.field, value)}
        proposal={value => target.proposal(this.props.field, value)}
        onComplete={value => target.change(this.props.field, value)
          .then(() => target.save())
          .then(() => target.turnEditorOff(this.props.cursor))
          .then(() => this.props.onComplete && this.props.onComplete())}
        onCancel={() => target.turnEditorOff(this.props.cursor)}
      />);
    }

    const column = this.props.entry ? this.props.entry.columns().indexOf(this.props.field) : null;
    let className = 'TransactionDetails ' +
      target.getClasses(column, this.props.cursor.row) +
      (this.props.error ? ' error' : '') +
      (this.props.classNames ? ' ' + this.props.classNames : '');

    // Currently we cannot determine if the selected entry belongs to the selected document in the model
    // level. Thus we remove sub-selection flags in case that they are not on the exact selected document
    // copy. Multiple instances of the same document is visible on the screen.
    if (this.props.cursor.index !== this.props.index) {
      className = className.replace(/ sub-selected/, '');
    }

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
