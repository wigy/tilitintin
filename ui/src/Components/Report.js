import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import ReportDisplay from './ReportDisplay';

@inject('store')
@observer
class Report extends Component {

  componentDidMount() {
    const {db, periodId, format} = this.props.match.params;
    this.props.store.getReport(db, periodId, format);
  }

  componentDidUpdate() {
    const {db, periodId, format} = this.props.match.params;
    this.props.store.getReport(db, periodId, format);
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }

    if (!this.props.store.report) {
      return '';
    }

    return (
      <div className="Report">
        <ReportDisplay report={this.props.store.report}></ReportDisplay>
      </div>
    );
  }
}

Report.propTypes = {
  store: PropTypes.instanceOf(Store)
};

export default Report;
