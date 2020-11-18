import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Cursor from '../Stores/Cursor';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

/**
 * A dialog.
 */
@inject('cursor')
@withTranslation('translations')
class TilitinDialog extends Component {

  componentDidMount = () => {
    this.props.cursor.setModal(this);
  }

  componentWillUnmount = () => {
    this.props.cursor.unsetModal();
  }

  keyEscape = () => {
    this.props.onClose(false);
    return { preventDefault: true };
  };

  keyEnter = () => {
    this.props.onClose(true);
    this.props.onConfirm();
    return { preventDefault: true };
  };

  render() {

    const { isVisible, isValid, title, onClose, children } = this.props;

    return (
      <Dialog open={isVisible} onClose={() => onClose()}>
        <DialogTitle onClose={() => onClose()}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
          {children}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={this.keyEscape}><Trans>Cancel</Trans></Button>
          <Button variant="outlined" onClick={this.keyEnter} disabled={isValid && !isValid()} color="primary"><Trans>Confirm</Trans></Button>
        </DialogActions>
      </Dialog>
    );
  }
}

TilitinDialog.propTypes = {
  isVisible: PropTypes.bool,
  isValid: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.any,
  cursor: PropTypes.instanceOf(Cursor),
};

export default TilitinDialog;
