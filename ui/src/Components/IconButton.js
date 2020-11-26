import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Icon, IconButton } from '@material-ui/core';

@withTranslation('translations')
class TilitintinIconButton extends Component {

  render() {
    const { t, disabled, title, onClick, icon, toggle } = this.props;
    let color = 'secondary';
    if (toggle !== undefined) {
      color = toggle ? 'secondary' : 'disabled';
    }
    return (
      <IconButton color={color} title={t('icon-' + title)} disabled={disabled} onClick={() => onClick()}>
        <Icon className={icon} style={{ fontSize: 30 }}/>
      </IconButton>
    );
  }
}

TilitintinIconButton.propTypes = {
  onClick: PropTypes.func,
  t: PropTypes.func,
  icon: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  disabled: PropTypes.bool
};

export default TilitintinIconButton;
