import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const Labeled = (props) => {
  return (
    <>
      <Typography color="secondary" variant="subtitle2">{props.title}</Typography>
      <div style={{ paddingLeft: '1rem' }}>{props.children}</div>
    </>
  )

}

Labeled.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
}

export default Labeled
