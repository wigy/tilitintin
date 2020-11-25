import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { PropTypes } from 'prop-types';

const Panel = ({ children }) => (
  <Card style={{ margin: '1rem' }}>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

Panel.propTypes = {
  children: PropTypes.node,
};

export default Panel;
