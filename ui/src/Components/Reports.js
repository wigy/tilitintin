import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@inject('cursor')
@observer
class Reports extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Reports');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="Reports">
        <h1>Raportit</h1>
        Ei saatavilla
      </div>
    );
  }
}

export default Reports;
