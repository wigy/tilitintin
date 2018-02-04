import React, { Component } from 'react';

class Reports extends Component {
  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="Reports">
        <h1>Reports</h1>
      </div>
    );
  }
}

export default Reports;
