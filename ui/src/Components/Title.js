import React from 'react';
import { PropTypes } from 'prop-types';
import { Typography } from '@material-ui/core';

const Title = ({ children }) => {
  return <Typography variant="h4" color="textSecondary">{children}</Typography>;
};

Title.propTypes = {
  children: PropTypes.instanceOf(Element),
};

export default Title;
