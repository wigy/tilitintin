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
