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
class ReportsList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Reports');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div>
        <h1><Trans>Reports</Trans></h1>
        <dl>
          {this.props.store.reports.map((report) => <li key={report.format}>
            <ReportLink report={report}/>
          </li>)}
        </dl>
      </div>
    );
  }
}

ReportsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default ReportsList;
