import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans, withTranslation } from 'react-i18next';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Store from '../Stores/Store';

@inject('store')
@withTranslation('translations')
@observer
class RegisterForm extends Component {

  state = {
    user: '',
    name: '',
    email: '',
    password: '',
    passwordAgain: ''
  }

  onRegister() {
    const { store } = this.props;
    const { user, name, email, password, passwordAgain } = this.state;
    store.messages.replace([]);

    if (!user || !/^[a-z0-9]+$/.test(user)) {
      store.messages.push(this.props.t('User name is not valid (lower case letters and numbers only).'));
    }
    if (password.length < 4) {
      store.messages.push(this.props.t('Password is too short.'));
    }
    if (password !== passwordAgain) {
      store.messages.push(this.props.t('Passwords do not match.'));
    }
    if (!email) {
      store.messages.push(this.props.t('Email is required.'));
    }
    if (!name) {
      store.messages.push(this.props.t('Full name is required.'));
    }

    if (store.messages.length) {
      return;
    }

    this.props.onRegister({ user, name, password, email });
  }

  render() {

    const { store } = this.props;

    return <form>
      <FormGroup>
        <ControlLabel><Trans>Username</Trans></ControlLabel>
        <FormControl type="text" onChange={(event) => (this.setState({ user: event.target.value }))}/>
        <ControlLabel><Trans>Full Name</Trans></ControlLabel>
        <FormControl type="text" onChange={(event) => (this.setState({ name: event.target.value }))}/>
        <ControlLabel><Trans>Email</Trans></ControlLabel>
        <FormControl type="text" onChange={(event) => (this.setState({ email: event.target.value }))}/>
        <ControlLabel><Trans>Password</Trans></ControlLabel>
        <FormControl type="password" onChange={(event) => (this.setState({ password: event.target.value }))}/>
        <ControlLabel><Trans>Password Again</Trans></ControlLabel>
        <FormControl type="password" onChange={(event) => (this.setState({ passwordAgain: event.target.value }))}/>
        <br/>
        <Button onClick={() => this.onRegister()}><Trans>Submit</Trans></Button>
      </FormGroup>
      {store.messages.map((msg, idx) => <div key={idx} className="message error">{msg}</div>)}
    </form>;
  }
}

RegisterForm.propTypes = {
  store: PropTypes.instanceOf(Store),
  onRegister: PropTypes.func,
  t: PropTypes.func
};

export default RegisterForm;
