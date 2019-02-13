import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate } from 'react-i18next';
import TextEdit from './TextEdit';
import Store from '../Stores/Store';
import EntryModel from '../Models/EntryModel';
import DocumentModel from '../Models/DocumentModel';
import Cursor from '../Stores/Cursor';
import { sprintf } from 'sprintf-js';
import moment from 'moment';

// import safeEval from 'safer-eval';

import './TransactionDetails.css';

// Helper to evaluate string expression value to number.
const str2num = (str) => {
  str = str.replace(',', '.').replace(/ /g, '');
  try {
    //  TODO: This crashes for some reason: safeEval(str, {navigator: window.navigator});
    /* eslint no-eval: off */
    return eval(str);
  } catch (err) {
    return NaN;
  }
};

// Helper to convert string to date.
const str2date = (str, sample) => {
  sample = sample ? new Date(sample) : new Date();
  // TODO: Localization support.
  if (/^\d{1,2}(\.\d{1,2})?(\.\d{2,4})?\.?$/.test(str)) {
    let [day, month, year] = str.split('.');
    day = parseInt(day);
    month = parseInt(month) || (sample.getMonth() + 1);
    year = parseInt(year) || sample.getFullYear();
    if (year < 100) {
      year += 2000;
    }
    const date = moment(sprintf('%04d-%02d-%02d', year, month, day));
    return date.isValid() ? date.format('YYYY-MM-DD') : undefined;
  }
};

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
    // TODO: This is messy and needs clean up.
    let target = this.props.type === 'date' ? this.props.document : this.props.entry;

    const text = target.getView(this.props.type);
    const edit = target.getEdit(this.props.type);

    // A function called after editing is finished.
    const onComplete = async (value) => {

      let data = {};

      switch (this.props.type) {
        case 'debit':
          if (value !== '') {
            data.debit = 1;
            data.amount = Math.round(str2num(value) * 100);
          }
          break;
        case 'credit':
          if (value !== '') {
            data.debit = 0;
            data.amount = Math.round(str2num(value) * 100);
          }
          break;
        case 'account':
          const account = this.props.store.accounts.filter(a => a.number === value);
          data.account_id = account[0].id;
          break;
        case 'description':
          data.description = value;
          data.tags = Object.values(this.props.entry.tags);
          break;
        case 'date':
          data.date = str2date(value, this.props.store.lastDate);
          this.props.store.lastDate = data.date;
          break;
        default:
      }

      // Update or create transaction first.
      if (data.date || !this.props.entry.document_id) {
        await this.props.store.saveDocument(this.props.document, data);
        if (this.props.entry) {
          this.props.entry.document_id = this.props.document.id;
        } else {
          this.props.cursor.setCell(1, 0);
          return Promise.resolve();
        }
      }

      return this.props.store.saveEntry(this.props.entry, data, this.props.document)
        .then((res) => {
          this.props.cursor.selectEditing(false);
        });
    };

    // Cancel editing.
    const onCancel = () => {
      this.props.cursor.editor = null;
    };

    // Value changed.
    const onChange = (value) => {
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
    };

    // TODO: Must handle editing of the entry's account number, when it is the same as transaction's.
    // TODO: Handle date editing.
    if (this.props.entry && this.props.entry.edit && this.props.entry.column === this.props.type) {
      return (<TextEdit
        value={edit}
        validate={value => target.validate(this.props.type, value)}
        proposal={this.state.proposal}
        onComplete={value => onComplete(value).then(() => {
          this.props.onComplete && this.props.onComplete();
        })}
        onChange={(value) => onChange(value)}
        onCancel={() => onCancel()}
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
