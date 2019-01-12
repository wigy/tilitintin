import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import './ToolPanel.css';

@inject('store')
@observer
class ToolPanel extends Component {

  render() {
    if (!this.props.store.token || !this.props.store.report) {
      return '';
    }

    const onPrint = () => {
      window.print();
    };

    return (
      <div className="ToolPanel">
        <h1><Trans>{this.props.store.report.format}</Trans></h1>
        <IconButton onClick={onPrint} title="print" icon="fa-print"></IconButton>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  store: PropTypes.instanceOf(Store)
};

export default ToolPanel;
