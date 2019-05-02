import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import AccountTable from '../Components/AccountTable';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import TextEdit from './TextEdit';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Accounts extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Accounts');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="Accounts">
        <h1><Trans>Account scheme</Trans></h1>
        <TextEdit value="xyzzy" proposal={async () => [
          'Ahjkshdkjsa hksadasd',
          'Ahjkshda hksadasd',
          'Ahjksha hksadasd',
          'Ahjkshadasd'
        ]}></TextEdit>
        <AccountTable accounts={this.props.store.accounts} headings={this.props.store.headings} />
      </div>
    );
  }
}

Accounts.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default Accounts;
