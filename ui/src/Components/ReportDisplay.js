import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate, I18n } from 'react-i18next';
import ReportLine from './ReportLine';
import './ReportDisplay.css';

@translate('translations')
class ReportHeader extends Component {

  render() {
    const lang = this.props.i18n.language;
    const columns = this.props.report.columns.length + 1;

    const localize = (title) => {
      let match = /\b(\d\d\d\d-\d\d-\d\d)\b/g.exec(title);
      if (match) {
        title = title.replace(match[1], new Date(match[1]).toLocaleDateString(lang));
      }
      match = /\b(\d\d\d\d-\d\d-\d\d)\b/g.exec(title);
      if (match) {
        title = title.replace(match[1], new Date(match[1]).toLocaleDateString(lang));
      }
      return title;
    };

    return [
      <tr key="1" className="heading1">
        <th colSpan={columns} style={{textAlign: 'center'}}>
          <span style={{float: 'left'}}>{'Company Oy'}</span>
          <span className="report-title">{<Trans>{this.props.report.format}</Trans>}</span>
        </th>
      </tr>,
      <tr key="2" className="heading2">
        <th colSpan={columns}>
          <span>{'Y-TUNNUS'}</span>
          <span style={{float: 'right'}}>{new Date().toLocaleDateString(lang)}</span>
        </th>
      </tr>,
      <tr key="3" className="columns">
        <th></th>
        {this.props.report.columns.map((column) => <th key={column.name}>
          {localize(column.title)}
        </th>)}
      </tr>
    ];
  }
}

ReportHeader.propTypes = {
  report: PropTypes.object.isRequired,
  i18n: PropTypes.instanceOf(I18n)
};

class ReportDisplay extends Component {

  render() {
    return (
      <div className="ReportDisplay">
        <table className="ReportDisplay">
          <tbody>
            <ReportHeader report={this.props.report}></ReportHeader>
            {this.props.report.data.map((line, idx) => <ReportLine key={idx} line={line} columns={this.props.report.columns}></ReportLine>)}
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