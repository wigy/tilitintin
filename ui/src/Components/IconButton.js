import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import './IconButton.css';

@withTranslation('translations')
class ToolPanel extends Component {

  render() {
    const { t } = this.props;
    let className = 'IconButton';
    if ('toggle' in this.props && !this.props.toggle) {
      className += ' off';
    }
    if ('disabled' in this.props && this.props.disabled) {
      className += ' off';
    }
    return (
      <div className={className} title={t('icon-' + this.props.title)} onClick={() => !this.props.disabled && this.props.onClick()}>
        <div className="fa-icon">
          <i className={'fas fa-2x ' + this.props.icon}></i>
        </div>
      </div>
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
