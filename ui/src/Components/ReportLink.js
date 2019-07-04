import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import ReportModel from '../Models/ReportModel';

@translate('translations')
class ReportLink extends Component {
  render() {
    const { t, report } = this.props;
    const dst = '/' + report.database.name + '/report/' + report.period.id + '/' + (report.store.accountId || '') + '/' + report.format;

    return <Link to={dst}><code>{this.props.shortcut}</code> {t('report-' + report.format)}</Link>;
  }
}

ReportLink.propTypes = {
  t: PropTypes.func,
  shortcut: PropTypes.string,
  report: PropTypes.instanceOf(ReportModel)
};

export default ReportLink;
