import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const Labeled = (props) => {
  return (
    <div className={props.className || 'Labeled'}>
      <Typography color="secondary" variant="subtitle2">{props.title}</Typography>
      <div style={{ paddingLeft: '1rem' }}>{props.children}</div>
    </div>
  )

}

Labeled.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string
}

export default Labeled
