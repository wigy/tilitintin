import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';

@inject('cursor')
class Dialog extends Component {

  componentDidMount() {
    console.log('mount');
  }

  componentWillUnmount() {
    console.log('unmount');
  }

  render() {
    const onCancel = () => {
      this.props.onClose(false);
    };

    return (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{this.props.children}</Modal.Body>

        <Modal.Footer>
          <Button onClick={onCancel}>Cancel</Button>
          <Button bsStyle="primary">Yes</Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

export default Dialog;
