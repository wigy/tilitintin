import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Cursor from '../Stores/Cursor'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'

/**
 * A dialog.
 */
@inject('cursor')
@withTranslation('translations')
class TilitinDialog extends Component {

  componentDidMount = () => {
    this.props.cursor.addModal(this)
  }

  componentWillUnmount = () => {
    this.props.cursor.removeModal(this)
  }

  keyEscape = () => {
    this.props.onClose(false)
    return { preventDefault: true }
  };

  keyEnter = () => {
    this.props.onClose(true)
    this.props.onConfirm()
    return { preventDefault: true }
  };

  render() {

    const { isVisible, isValid, title, onClose, children, wider } = this.props

    return (
      <Dialog open={isVisible} onClose={() => onClose()} fullWidth={wider} maxWidth={wider ? 'sm' : undefined}>
        <DialogTitle onClose={() => onClose()}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
          {children}
        </DialogContent>
        <DialogActions>
          <Button id="Cancel" variant="outlined" onClick={this.keyEscape}><Trans>Cancel</Trans></Button>
          <Button id="OK" variant="outlined" onClick={this.keyEnter} disabled={isValid && !isValid()} color="primary"><Trans>Confirm</Trans></Button>
        </DialogActions>
      </Dialog>
    )
  }
}

TilitinDialog.propTypes = {
  isVisible: PropTypes.bool,
  isValid: PropTypes.func,
  className: PropTypes.string,
  wider: PropTypes.bool,
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.any,
  cursor: PropTypes.instanceOf(Cursor),
}

export default TilitinDialog
