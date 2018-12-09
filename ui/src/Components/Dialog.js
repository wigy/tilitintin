import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';
import { translate, Trans } from 'react-i18next';

/**
 * Dialog content implementation.
 */
@inject('cursor')
@translate('translations')
class DialogContent extends Component {

  componentDidMount = () => {
    this.props.cursor.activeModal = {
      onCancel: () => {
        this.onCancel();
      },
      onConfirm: () => {
        this.onConfirm();
      }
    };
  }

  componentWillUnmount = () => {
    this.props.cursor.activeModal = null;
  }

  onCancel = () => {
    this.props.onClose(false);
  };

  onConfirm = () => {
    this.props.onConfirm();
    this.props.onClose(true);
  };

  render() {

    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{this.props.children}</Modal.Body>

        <Modal.Footer>
          <Button onClick={this.onCancel}><Trans>Cancel</Trans></Button>
          <Button onClick={this.onConfirm} bsStyle="primary"><Trans>Confirm</Trans></Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

/**
 * Top level wrapper for dialog.
 */
class Dialog extends Component {

  render() {

    if (!this.props.isVisible) {
      return '';
    }

    return (
      <DialogContent title={this.props.title} onClose={this.props.onClose} onConfirm={this.props.onConfirm}>{this.props.children}</DialogContent>
    );
  }
}

export default Dialog;
