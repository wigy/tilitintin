import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import Configuration from '../Configuration';
import './ToolPanel.css';

@translate('translations')
@inject('store')
@observer
class ToolPanel extends Component {

  render() {
    const store = this.props.store;

    if (!store.token || !store.report) {
      return '';
    }

    const onPrint = () => {
      window.print();
    };

    const onDownload = () => {
      const url = `${Configuration.API_URL}/db/${store.db}/report/${store.report.format}/${store.periodId}?csv`;
      const hiddenElement = document.createElement('a');
      hiddenElement.href = url;
      hiddenElement.target = '_blank';
      hiddenElement.download = 'report.csv';
      hiddenElement.click();
    };

    return (
      <div className="ToolPanel">
        <h1>{this.props.t('report-' + store.report.format)}</h1>
        <IconButton onClick={onPrint} title="print" icon="fa-print"></IconButton>
        <IconButton onClick={onDownload} title="download-csv" icon="fa-download"></IconButton>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  t: PropTypes.func,
  store: PropTypes.instanceOf(Store)
};

export default ToolPanel;
