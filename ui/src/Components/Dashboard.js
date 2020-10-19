import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Link } from 'react-router-dom';
import Localize from './Localize';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Loading from './Loading';
import Title from './Title';

@withTranslation('translations')
@inject('cursor')
@inject('store')
@observer
class Dashboard extends Component {

  componentDidUpdate() {
    if (!this.props.store.database) {
      return;
    }
    if (this.props.store.database.name !== this.props.match.params.db) {
      this.props.store.setDb(this.props.match.params.db);
    }
  }

  componentDidMount() {
    this.props.cursor.selectPage('Dashboard', this);
  }

  selectDb(num) {
    const { dbs } = this.props.store;
    num--;
    if (num < dbs.length) {
      this.props.history.push(`/${dbs[num].name}`);
    }
  }

  selectPeriod(num) {
    if (!this.props.store.database) {
      return;
    }
    const periods = this.props.store.database.periods.reverse();
    num--;
    if (num < periods.length) {
      this.props.history.push(`/${this.props.store.db}/dashboard/${periods[num].id}`);
    }
  }

  keyText(cursor, key) {
    if (key >= '1' && key <= '9') {
      this.selectPeriod(parseInt(key));
    }
    key = key.toUpperCase();
    if (key >= 'A' && key <= 'Z') {
      this.selectDb(key.charCodeAt(0) - 64);
    }
  }

  render() {
    const { store } = this.props;
    if (!store.token) {
      return '';
    }
    if (!store.db) {
      return <>
        <Title><Trans>No Database Selected</Trans></Title>
      </>;
    }
    const { periodId } = this.props.match.params;

    return (
      <div className="Dashboard">
        <Title><Trans>Database</Trans>: {store.db}</Title>
        <h2><Trans>Company Info</Trans></h2>
        <b><Trans>Business name</Trans>: {store.settings.BUSINESS_NAME}</b><br />
        <b><Trans>Business ID</Trans>: {store.settings.BUSINESS_ID}</b><br />
        <h2><Trans>Periods</Trans></h2>
        <Loading visible={store.loading} />
        <ul className="menu">
          {store.database.periods.reverse().map((period, index) => <li key={period.id} className={parseInt(periodId) === period.id ? 'period current' : 'period'}>
            <Link to={`/${store.db}/dashboard/${period.id}`}>
              <code>{index + 1}</code>&nbsp;
              <Localize date={period.start_date} /> &mdash; <Localize date={period.end_date} />
            </Link>
          </li>)}
        </ul>
      </div>
    );
  }
}

Dashboard.propTypes = {
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default Dashboard;
