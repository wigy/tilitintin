import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import './IconButton.css';

@translate('translations')
class ToolPanel extends Component {

  render() {
    const { t } = this.props;
    const className = 'IconButton' + ('toggle' in this.props && !this.props.toggle ? ' off' : '');
    return (
      <div className={className} title={t('icon-' + this.props.title)} onClick={this.props.onClick}>
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
  toggle: PropTypes.bool
};

export default ToolPanel;
