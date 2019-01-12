import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';

@translate('translations')
class ReportLink extends Component {
  render() {
    const { t } = this.props;
    const dst = '/' + this.props.db + '/report/' + this.props.periodId + '/' + (this.props.accountId || 'none') + '/' + this.props.format;
    return (<Link to={dst}>
      {t('report-' + this.props.format)}
    </Link>);
  }
}

ReportLink.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.number,
  accountId: PropTypes.number,
  format: PropTypes.string
};

export default ReportLink;
