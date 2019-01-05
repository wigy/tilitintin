import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';

@translate('translations')
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
        <h1><Trans>{this.props.store.report.format}</Trans></h1>
        {JSON.stringify(this.props.store.report.data)}
      </div>
    );
  }
}

Report.propTypes = {
  store: PropTypes.instanceOf(Store)
};

export default Report;
