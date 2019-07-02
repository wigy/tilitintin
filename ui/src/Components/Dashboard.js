import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Localize from './Localize';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import './Dashboard.css';

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
    if (!this.props.store.db) {
      return <h1><Trans>No Database Selected</Trans></h1>;
    }
    const {periodId} = this.props.match.params;

    return (
      <div className="Dashboard">
        <h1><Trans>Database</Trans>: {this.props.store.db}</h1>
        <h2><Trans>Company Info</Trans></h2>
        <b><Trans>Business name</Trans>: {this.props.store.settings.BUSINESS_NAME}</b><br />
        <b><Trans>Business ID</Trans>: {this.props.store.settings.BUSINESS_ID}</b><br />
        <h2><Trans>Periods</Trans></h2>
        {this.props.store.database.periods.reverse().map((period) => <div key={period.id} className={parseInt(periodId) === period.id ? 'period current' : 'period'}>
          <Link to={`/${this.props.store.db}/dashboard/${period.id}`}>
            <Localize date={period.start_date} /> &mdash; <Localize date={period.end_date} />
          </Link>
        </div>)}
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
