import React from 'react';
import PropTypes from 'prop-types';

import './SubPanel.css';

const SubPanel = (props) => {
  return (<div className="SubPanel">{props.children}</div>);
};

SubPanel.propTypes = {
  children: PropTypes.any
};

export default SubPanel;
