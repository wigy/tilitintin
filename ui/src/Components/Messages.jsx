import React, { Component } from 'react'
import { Snackbar, IconButton } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { inject, observer } from 'mobx-react'
import { PropTypes } from 'prop-types'
import Store from '../Stores/Store'
import Loading from './Loading'

@inject('store')
@observer
class Messages extends Component {

  removeMessage(message) {
    this.props.store.removeMessage(message)
  }

  renderMessage(message) {
    return (
      <div key={message.id} className={`Message ${message.type}`}>
        {message.text}
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => this.removeMessage(message)}>
          <Close fontSize="small" />
        </IconButton>
      </div>
    )
  }

  render() {
    const { messages, loading } = this.props.store
    let severity = 'info'
    if (messages.filter(m => m.type === 'error').length) {
      severity = 'error'
    }
    return (
      <div>
        <Loading visible={loading} />
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={messages.length > 0}
        >
          <Alert variant="filled" elevation={6} severity={severity}>
            {messages.map(message => this.renderMessage(message))}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

Messages.propTypes = {
  store: PropTypes.instanceOf(Store)
}

export default Messages
