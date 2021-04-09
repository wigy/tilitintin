import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography } from '@material-ui/core'

const SubPanel = (props) => {
  return (
    <Card variant="outlined" style={{ margin: '1rem' }}>
      <CardContent>
        <Typography variant="body1" component="div">
          {props.children}
        </Typography>
      </CardContent>
    </Card>
  )

}

SubPanel.propTypes = {
  children: PropTypes.node,
}

export default SubPanel
