import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@translate('translations')
@inject('cursor')
@inject('store')
@observer
class Dashboard extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Dashboard');
  }

  componentDidUpdate() {
    if (!this.props.store.database) {
      return;
    }
    if (this.props.store.database.name !== this.props.match.params.db) {
      this.props.store.setDb(this.props.match.params.db);
    }
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="Dashboard">
        <h1>{this.props.store.db ? <><Trans>Database:</Trans> {this.props.store.db}</> : <Trans>No Database</Trans>}</h1>
        <b><Trans>Business name</Trans>: {this.props.store.settings.BUSINESS_NAME}</b><br />
        <b><Trans>Business ID</Trans>: {this.props.store.settings.BUSINESS_ID}</b><br />
      </div>
    );
  }
}

Dashboard.propTypes = {
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default Dashboard;
