import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import './ToolPanel.css';

@inject('store')
@inject('cursor')
@observer
class AccountsToolPanel extends Component {

  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="ToolPanel">
        <h1><Trans>Accounts</Trans></h1>
      </div>
    );
  }
}

AccountsToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default AccountsToolPanel;
