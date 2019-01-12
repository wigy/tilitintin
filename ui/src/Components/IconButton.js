import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './IconButton.css';

class ToolPanel extends Component {

  render() {
    return (
      <div className="IconButton" title={this.props.title} onClick={this.props.onClick}>
        <div className="fa-icon">
          <i className={'fas fa-2x ' + this.props.icon}></i>
        </div>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.string,
  title: PropTypes.string
};

export default ToolPanel;
