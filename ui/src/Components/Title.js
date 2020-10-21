import React from 'react';
import { PropTypes } from 'prop-types';
import { Typography } from '@material-ui/core';
import './Title.css';

const Title = ({ children }) => {
  return <div className="Title">
    <Typography className="text" variant="h5">{children}</Typography>
  </div>;
};

Title.propTypes = {
  children: PropTypes.any,
};

export default Title;
