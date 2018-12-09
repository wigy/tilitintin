import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Dialog content implementation.
 */
@inject('cursor')
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
    this.props.onClose(true);
  };

  render() {

    // TODO: Translate buttons.

    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{this.props.children}</Modal.Body>

        <Modal.Footer>
          <Button onClick={this.onCancel}>Cancel</Button>
          <Button onClick={this.onConfirm} bsStyle="primary">Confirm</Button>
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
