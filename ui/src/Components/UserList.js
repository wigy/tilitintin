import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@translate('translations')
@inject('store')
@observer
class ToolsList extends Component {

  render() {
    const { store } = this.props;
    if (!store.token) {
      return '';
    }

    return (
      <div>
        <h1><Trans>Users</Trans></h1>
      </div>
    );
  }
}

ToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
};

export default ToolsList;
