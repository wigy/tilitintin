import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, I18n } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Configuration from '../Configuration';
import './ToolPanel.css';

const ICONS = {
  'option-compact': 'fa-tasks'
};

@translate('translations')
@inject('store')
@observer
class ToolPanel extends Component {

  render() {
    const store = this.props.store;
    const lang = this.props.i18n.language;

    if (!store.token || !store.report) {
      return '';
    }

    const onPrint = () => {
      window.print();
    };

    const onDownload = () => {
      const url = `${Configuration.API_URL}/db/${store.db}/report/${store.report.format}/${store.periodId}?csv&lang=${lang}`;

      fetch(url, {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Bearer ' + store.token
        })
      })
        .then(response => response.blob())
        .then(blob => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.download = store.report.fileName();
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
    };

    const onToggle = (option) => {
      store.report.config[option] = !store.report.config[option];
      store.fetchReport(store.db, store.periodId, store.report.format);
    };

    const options = Object.keys({...store.report.options});

    let buttons = [
      <IconButton key="button-print" onClick={onPrint} title="print" icon="fa-print"></IconButton>,
      <IconButton key="button-download" onClick={onDownload} title="download-csv" icon="fa-download"></IconButton>
    ];

    if (options.length) {
      buttons.push(<IconSpacer key="space"/>);
      options.forEach((option) => {
        const name = `option-${option}`;
        buttons.push(<IconButton
          key={name}
          toggle={store.report.config[option]}
          onClick={() => onToggle(option)}
          title={name}
          icon={ICONS[name] || 'fa-cog'}>
        </IconButton>);
      });
    }

    return (
      <div className="ToolPanel">
        <h1>{this.props.t('report-' + store.report.format)}</h1>
        {buttons}
      </div>
    );
  }
}

ToolPanel.propTypes = {
  t: PropTypes.func,
  i18n: PropTypes.instanceOf(I18n),
  store: PropTypes.instanceOf(Store)
};

export default ToolPanel;
