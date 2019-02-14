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

    const text = target.getView(this.props.field);
    const edit = target.getEdit(this.props.field);

    // TODO: Must handle editing of the entry's account number, when it is the same as transaction's.
    // TODO: Handle date editing.
    // TODO: Handle date saving.
    // TODO: Many props not necessary, since model is passed.
    if (this.props.entry && this.props.entry.edit && this.props.entry.column === this.props.field) {
      return (<TextEdit
        value={edit}
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
    const className = 'TransactionDetails ' +
      target.getClasses(column, this.props.cursor.row) +
      (this.props.error ? ' error' : '') +
      (this.props.classNames ? ' ' + this.props.classNames : '');

    return (
      <div className={className}>{text}&nbsp;</div>
    );
  }
}

TransactionDetails.propTypes = {
  document: PropTypes.instanceOf(DocumentModel),
  entry: PropTypes.instanceOf(EntryModel),
  field: PropTypes.string,
  classNames: PropTypes.string,
  error: PropTypes.bool,
  onComplete: PropTypes.func,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default TransactionDetails;
