import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import ReportDisplay from './ReportDisplay';

@inject('store')
@observer
class Report extends Component {

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
