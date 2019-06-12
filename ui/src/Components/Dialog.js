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

        <Modal.Body><div className={this.props.className}>{this.props.children}</div></Modal.Body>

        <Modal.Footer>
          <Button onClick={this.keyEscape}><Trans>Cancel</Trans></Button>
          <Button onClick={this.keyEnter} disabled={this.props.isValid && !this.props.isValid()} bsStyle="primary"><Trans>Confirm</Trans></Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

DialogContent.propTypes = {
  isValid: PropTypes.func,
  className: PropTypes.string,
  cursor: PropTypes.instanceOf(Cursor),
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
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
      <DialogContent
        title={this.props.title}
        isValid={this.props.isValid}
        className={this.props.className}
        onClose={this.props.onClose}
        onConfirm={this.props.onConfirm}>
        {this.props.children}
      </DialogContent>
    );
  }
}

Dialog.propTypes = {
  isVisible: PropTypes.bool,
  isValid: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

export default Dialog;
