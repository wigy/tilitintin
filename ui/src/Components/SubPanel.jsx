import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography } from '@material-ui/core'

const SubPanel = (props) => {
  return (
    <Card className={props.className || ''} variant="outlined" style={{ margin: '1rem' }}>
      <CardContent>
        <Typography variant="body1" component="div">
          {props.children}
        </Typography>
      </CardContent>
    </Card>
  )

}

SubPanel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export default SubPanel
