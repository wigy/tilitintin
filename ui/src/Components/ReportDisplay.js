import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, I18n } from 'react-i18next';
import ReportLine from './ReportLine';
import Localize from './Localize';
import './ReportDisplay.css';

@translate('translations')
class ReportHeader extends Component {

  render() {
    const { report } = this.props;
    const lang = this.props.i18n.language;
    const columns = report.columns.length;

    return [
      <tr key="1" className="heading1">
        <th colSpan={columns}>
          <span className="report-title">{this.props.t('report-' + report.format)}</span>
          <span style={{float: 'right'}}>{report.meta.businessName}</span>
        </th>
      </tr>,
      <tr key="2" className="heading2">
        <th colSpan={columns}>
          <span>{new Date().toLocaleDateString(lang)}</span>
          <span style={{float: 'right'}}>{report.meta.businessId}</span>
        </th>
      </tr>,
      <tr key="3" className="columns">
        {report.columns.map((column) => <th key={column.name} className={column.type}>
          <Localize>{column.title}</Localize>
        </th>)}
      </tr>
    ];
  }
}

ReportHeader.propTypes = {
  report: PropTypes.object.isRequired,
  t: PropTypes.func,
  i18n: PropTypes.instanceOf(I18n)
};

class ReportDisplay extends Component {

  render() {
    const { report } = this.props;

    return (
      <div className="ReportDisplay">
        <table className="ReportDisplay">
          <tbody>
            <ReportHeader report={this.props.report}></ReportHeader>
            {report.data.map((line, idx) => <ReportLine key={idx} line={line} columns={report.columns}></ReportLine>)}
          </tbody>
        </table>
      </div>
    );
  }
}

ReportDisplay.propTypes = {
  report: PropTypes.object.isRequired
};

export default ReportDisplay;
