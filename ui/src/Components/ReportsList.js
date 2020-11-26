import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@material-ui/core';

@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class ReportsList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Reports', this);
    const { format } = this.props.match.params;
    if (!format && this.props.store.report) {
      this.selectReportFormat(this.props.store.report);
    }
  }

  selectReportFormat(report) {
    const url = '/' + report.database.name + '/report/' + report.period.id + '/' + (report.store.accountId || '') + '/' + report.format;
    this.props.history.push(url);
  }

  selectReport(num) {
    const { reports } = this.props.store;
    num--;
    if (num < 0 || num >= reports.length) {
      return;
    }
    const report = reports[num];
    this.selectReportFormat(report);

    return { preventDefault: true };
  }

  keyText(cursor, key) {
    if (key >= '1' && key <= '9') {
      return this.selectReport(parseInt(key));
    }
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const { t, match } = this.props;

    return (
      <div>
        <Title>Reports</Title>
        <List>
          {this.props.store.reports.map((report, index) => (
            <ListItem key={report.format} button selected={report.format === match.params.format} onClick={() => this.selectReportFormat(report)}>
              <ListItemAvatar color="primary">
                <Avatar>{index + 1}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={t('report-' + report.format)} />
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

ReportsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history.isRequired,
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store),
  t: PropTypes.func,
};

export default ReportsList;
