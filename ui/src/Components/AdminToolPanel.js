import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import IconButton from './IconButton';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@withTranslation('translations')
@inject('store')
@observer
class AdminToolPanel extends Component {

  render() {
    const { store } = this.props;
    if (!store.token) {
      return '';
    }

    return (
      <div className="ToolPanel AdminToolPanel">
        <h1><Trans>Admin Tools</Trans></h1>
        <IconButton onClick={() => this.props.history.push('/_/admin/[create]')} title="create-user" icon="fas fa-user-plus"></IconButton>
      </div>
    );
  }
}

AdminToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
};

export default AdminToolPanel;
