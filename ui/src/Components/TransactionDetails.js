import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import TextEdit from './TextEdit';
import Store from '../Stores/Store';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import LinkedText from '../Models/LinkedText';
import Cursor from '../Stores/Cursor';
import { withRouter } from 'react-router-dom';
import './TransactionDetails.css';
import { Link } from '@material-ui/core';
import ReactRouterPropTypes from 'react-router-prop-types';

@withRouter
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
    const view = target.getView(this.props.field);
    if (view instanceof LinkedText) {
      return <div className={className}><Link color="inherit" onClick={() => this.props.history.push(view.url)}>{view.text}</Link></div>;
    }
    return (
      <div className={className}>{view}&nbsp;</div>
    );
  }
}

TransactionDetails.propTypes = {
  classNames: PropTypes.string,
  cursor: PropTypes.instanceOf(Cursor),
  document: PropTypes.instanceOf(DocumentModel),
  entry: PropTypes.instanceOf(EntryModel),
  error: PropTypes.bool,
  field: PropTypes.string,
  history: ReactRouterPropTypes.history,
  index: PropTypes.number,
  onComplete: PropTypes.func,
  store: PropTypes.instanceOf(Store),
};

export default TransactionDetails;
