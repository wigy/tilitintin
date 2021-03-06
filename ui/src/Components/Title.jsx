import React from 'react'
import { PropTypes } from 'prop-types'
import { Typography } from '@material-ui/core'

const Title = ({ children, className }) => {
  return <div className={className ? `${className} Title` : 'Title'} style={{ paddingLeft: '2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
    <Typography className="text" variant="h5">{children}</Typography>
  </div>
}

Title.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
}

export default Title
