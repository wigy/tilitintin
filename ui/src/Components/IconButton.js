import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Icon, IconButton } from '@material-ui/core';

@withTranslation('translations')
class ToolPanel extends Component {

  render() {
    const { t } = this.props;

    return (
      <IconButton color="secondary" title={t('icon-' + this.props.title)} disabled={this.props.disabled} onClick={() => this.props.onClick()}>
        <Icon className={this.props.icon} style={{ fontSize: 30 }}/>
      </IconButton>
    );
  }
}

ToolPanel.propTypes = {
  onClick: PropTypes.func,
  t: PropTypes.func,
  icon: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  disabled: PropTypes.bool
};

export default ToolPanel;
