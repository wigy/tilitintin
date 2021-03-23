import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import ReportDisplay from './ReportDisplay';
import Loading from './Loading';

@inject('store')
@observer
class Report extends Component {

  componentDidMount() {
    const { db, periodId, format } = this.props.match.params;
    this.props.store.fetchReport(db, periodId, format);
  }

  componentDidUpdate() {
    const { db, periodId, format } = this.props.match.params;
    this.props.store.fetchReport(db, periodId, format);
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="Report">
        {this.props.store.report && <ReportDisplay report={this.props.store.report}></ReportDisplay>}
      </div>
    );
  }
}

Report.propTypes = {
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};
export default Report;
