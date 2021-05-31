import React from 'react'
import { PropTypes } from 'prop-types'
import { Typography } from '@material-ui/core'

const Note = ({ children, className, showIf }) => {
  if (showIf !== undefined && !showIf) {
    return <></>
  }
  return (
    <Typography className={className || 'Note'} color="error" align="center" variant="h6">
      {children}
    </Typography>
  )
}

Note.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  showIf: PropTypes.bool
}

export default Note
