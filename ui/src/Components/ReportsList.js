import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
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
    this.props.cursor.selectPage('Reports', this);
  }

  selectReport(num) {
    const { reports } = this.props.store;
    num--;
    if (num < 0 || num >= reports.length) {
      return;
    }
    const report = reports[num];
    const url = '/' + report.database.name + '/report/' + report.period.id + '/' + (report.store.accountId || '') + '/' + report.format;
    this.props.history.push(url);

    return {preventDefault: true};
  }

  keyCtrl1 = () => this.selectReport(1);
  keyCtrl2 = () => this.selectReport(2);
  keyCtrl3 = () => this.selectReport(3);
  keyCtrl4 = () => this.selectReport(4);
  keyCtrl5 = () => this.selectReport(5);
  keyCtrl6 = () => this.selectReport(6);
  keyCtrl7 = () => this.selectReport(7);
  keyCtrl8 = () => this.selectReport(8);
  keyCtrl9 = () => this.selectReport(9);

  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div>
        <h1><Trans>Reports</Trans></h1>
        <ul className="menu">
          {this.props.store.reports.map((report, index) => <li key={report.format}>
            <ReportLink shortcut={`Ctrl+${index + 1}`} report={report}/>
          </li>)}
        </ul>
      </div>
    );
  }
}

ReportsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
};

export default ReportsList;
