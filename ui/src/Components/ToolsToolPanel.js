import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, I18n, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import './ToolPanel.css';

@translate('translations')
@inject('store')
@observer
class ToolsToolPanel extends Component {

  /**
   * Copy a description to the empty VAT fields usually inherited from Tilitin data.
   */
  async fixDescriptions() {
    const entriesChanged = new Set();
    this.props.store.getAllDocuments().forEach((doc) => {
      doc.entries.forEach((entry) => {
        if (entry.text === '') {
          const samples = doc.entries.filter((e) => e.text !== '');
          if (samples.length) {
            entry.setText(samples[0].text);
            entriesChanged.add(entry);
          }
        }
      });
    });
    for (const entry of [...entriesChanged]) {
      await entry.save();
    }
  }

  render() {
    const store = this.props.store;
    const tool = this.props.match.params.tool || 'vat';

    if (!store.token) {
      return '';
    }

    let buttons, label;

    switch (tool) {
      case 'vat':
        label = 'Value Added Tax';
        buttons = [
          <IconButton key="button-fix" onClick={() => this.fixDescriptions()} title="fix-vat-descriptions" icon="fa-paperclip"></IconButton>,
          <IconButton key="button-vat" onClick={null} title="summarize-vat-period" icon="fa-balance-scale"></IconButton>
        ];
        break;

      default:
        buttons = [];
    }

    return (
      <div className="ToolPanel">
        <h1><Trans>{label}</Trans></h1>
        {buttons}
      </div>
    );
  }
}

ToolsToolPanel.propTypes = {
  t: PropTypes.func,
  match: PropTypes.object,
  i18n: PropTypes.instanceOf(I18n),
  store: PropTypes.instanceOf(Store)
};

export default ToolsToolPanel;
