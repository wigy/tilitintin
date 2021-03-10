import React from 'react';
import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import { PropTypes } from 'prop-types';

const Panel = ({ children, title }) => (
  <Card style={{ margin: '1rem' }}>
    {
      title && <CardHeader title={<Typography variant="h5" color="textSecondary">{title}</Typography>} />
    }
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

Panel.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
};

export default Panel;
