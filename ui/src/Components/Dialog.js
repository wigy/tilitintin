import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';
import { translate, Trans } from 'react-i18next';
import Cursor from '../Stores/Cursor';

/**
 * Dialog content implementation.
 */
@inject('cursor')
@translate('translations')
class DialogContent extends Component {

  componentDidMount = () => {
    this.props.cursor.activeModal = this;
  }

  componentWillUnmount = () => {
    this.props.cursor.activeModal = null;
  }

  keyEscape = () => {
    this.props.onClose(false);
    return {preventDefault: true};
  };

  keyEnter = () => {
    this.props.onClose(true);
    this.props.onConfirm();
    return {preventDefault: true};
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

DialogContent.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.array
};

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

Dialog.propTypes = {
  isVisible: PropTypes.bool,
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.array
};

export default Dialog;
