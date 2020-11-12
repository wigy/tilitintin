import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Cursor from '../Stores/Cursor';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Button } from 'react-bootstrap';

/**
 * Dialog content implementation.
 */
class XDialogContent extends Component {

  render() {
    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body><div className={this.props.className}>{this.props.children}</div></Modal.Body>

        <Modal.Footer>
          <Button onClick={this.keyEscape}><Trans>Cancel</Trans></Button>
          <Button onClick={this.keyEnter} disabled={this.props.isValid && !this.props.isValid()} bsStyle="primary"><Trans>Confirm</Trans></Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

/**
 * A dialog.
 */
@inject('cursor')
@withTranslation('translations')
class TilitinDialog extends Component {

  componentDidMount = () => {
    this.props.cursor.activeModal = this;
  }

  componentWillUnmount = () => {
    this.props.cursor.activeModal = null;
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

    const { isVisible, isValid, title, onClose, onConfirm, children } = this.props;

    return (
      <Dialog open={isVisible} onClose={() => onClose()}>
        <DialogTitle id="customized-dialog-title" onClose={() => onClose()}>
          Modal title
        </DialogTitle>
        <DialogContent dividers>
          {children}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => 1} color="primary">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    );
    /*
    return (
      <DialogContent
        title={title}
        isValid={isValid}
        onClose={onClose}
        onConfirm={onConfirm}>
        {children}
      </DialogContent>
    );
    */
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
