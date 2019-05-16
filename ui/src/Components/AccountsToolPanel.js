import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import './ToolPanel.css';

@inject('store')
@inject('cursor')
@observer
class AccountsToolPanel extends Component {

  render() {
    const store = this.props.store;
    if (!store.token) {
      return '';
    }
    return (
      <div className="ToolPanel">
        <h1><Trans>Accounts</Trans></h1>
        <IconButton key="button-favorite" title="favorite" icon="far fa-star"
          toggle={store.tools.accounts.favorite}
          onClick={() => (store.tools.accounts.favorite = !store.tools.accounts.favorite)}
        />
        <IconSpacer/>
      </div>
    );
  }
}

AccountsToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default AccountsToolPanel;
