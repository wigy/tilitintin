import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, I18n } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import './ToolPanel.css';

@translate('translations')
@inject('store')
@observer
class ToolsToolPanel extends Component {

  render() {
    const store = this.props.store;

    if (!store.token) {
      return '';
    }

    let buttons = [
      <IconButton key="button-vat" onClick={null} title="summarize-vat-period" icon="fa-balance-scale"></IconButton>
    ];

    return (
      <div className="ToolPanel">
        {buttons}
      </div>
    );
  }
}

ToolsToolPanel.propTypes = {
  t: PropTypes.func,
  i18n: PropTypes.instanceOf(I18n),
  store: PropTypes.instanceOf(Store)
};

export default ToolsToolPanel;
