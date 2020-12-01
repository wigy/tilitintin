import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, Typography, CardContent } from '@material-ui/core';

const SubPanel = (props) => {
  return (
    <Card variant="outlined" style={{ margin: '1rem' }}>
      <CardContent>
        {props.children}
      </CardContent>
    </Card>
  );

};

SubPanel.propTypes = {
  children: PropTypes.any
};

export default SubPanel;
