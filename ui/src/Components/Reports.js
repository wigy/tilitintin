import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Reports extends Component {
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
}));
