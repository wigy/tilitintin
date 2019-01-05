import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import ReportLink from './ReportLink';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Reports extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Reports');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const { db, periodId, account } = this.props.store;

    return (
      <div className="Reports">
        <h1><Trans>Reports</Trans></h1>
        <dl>
          {this.props.store.reports.map((format) => <li key={format}>
            <ReportLink db={db} periodId={periodId} accountId={account.id} format={format}/>
          </li>)}
        </dl>
      </div>
    );
  }
}

Reports.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default Reports;
