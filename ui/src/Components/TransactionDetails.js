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

  constructor(props) {
    super(props);
    this.state = {proposal: props.proposal};
  }

  render() {
    let target = this.props.type === 'date' ? this.props.document : this.props.entry;

    const text = target.getView(this.props.type);
    const edit = target.getEdit(this.props.type);

    // Value changed.
    const onChange = (value) => {
      /*
      TODO: Alter this to async proposal generator function.
      let proposal = null;
      switch (this.props.type) {
        case 'account':
          break;
        case 'description':
          if (value.endsWith(' ')) {
            proposal = this.props.store.descriptionProposal(this.props.entry, value);
          }
          break;
        case 'credit':
        case 'debit':
          if (value === ' ') {
            proposal = this.props.proposal;
          }
          break;
        case 'date':
          break;
        default:
          return 'TODO';
      }
      this.setState({proposal});
      */
    };

    // TODO: Must handle editing of the entry's account number, when it is the same as transaction's.
    // TODO: Handle date editing.
    // TODO: Handle date saving.
    if (this.props.entry && this.props.entry.edit && this.props.entry.column === this.props.type) {
      return (<TextEdit
        value={edit}
        validate={value => target.validate(this.props.type, value)}
        proposal={this.state.proposal}
        onComplete={value => target.change(this.props.type, value)
          .then(() => target.save())
          .then(() => target.turnEditorOff(this.props.cursor))
          .then(() => this.props.onComplete && this.props.onComplete())}
        onChange={(value) => onChange(value)}
        onCancel={() => target.turnEditorOff(this.props.cursor)}
      />);
    }

    const column = this.props.entry ? this.props.entry.columns().indexOf(this.props.type) : null;
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
  type: PropTypes.string, // TODO: Rename as 'field'.
  classNames: PropTypes.string,
  proposal: PropTypes.string,
  error: PropTypes.bool,
  onComplete: PropTypes.func,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default TransactionDetails;
