import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import './ToolPanel.css';

@translate('translations')
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
        <h1>{this.props.t('report-' + this.props.store.report.format)}</h1>
        <IconButton onClick={onPrint} title="print" icon="fa-print"></IconButton>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  store: PropTypes.instanceOf(Store)
};

export default ToolPanel;
