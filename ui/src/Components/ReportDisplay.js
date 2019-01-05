import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import ReportLine from './ReportLine';

class ReportDisplay extends Component {

  render() {

    return (
      <div className="ReportDisplay">
        <h1><Trans>{this.props.report.format}</Trans></h1>
        {this.props.report.data.map((line, idx) => <ReportLine key={idx} line={line}></ReportLine>)}
      </div>
    );
  }
}

ReportDisplay.propTypes = {
  report: PropTypes.object.isRequired
};

export default ReportDisplay;
