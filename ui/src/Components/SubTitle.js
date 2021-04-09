import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const SubTitle = (props) => {
  return (
    <Typography color="primary" variant="subtitle1">{props.children}</Typography>
  )

}

SubTitle.propTypes = {
  children: PropTypes.node,
}

export default SubTitle
