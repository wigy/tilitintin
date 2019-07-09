import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Store from '../Stores/Store';
import { inject } from 'mobx-react';
import './Login.css';

@inject('store')
@translate('translations')
class RegisterForm extends Component {

  state = {
    user: '',
    password: ''
  }

  onLogin() {
    this.props.onLogin({ user: this.state.user, password: this.state.password });
  }

  render() {

    const { store } = this.props;

    return <form>
      <FormGroup>
        <ControlLabel><Trans>Username</Trans></ControlLabel>
        <FormControl type="text" onChange={(event) => (this.setState({user: event.target.value}))}/>
        <ControlLabel><Trans>Password</Trans></ControlLabel>
        <FormControl type="password" onChange={(event) => (this.setState({password: event.target.value}))}/>
        <br/>
        <Button onClick={() => this.onLogin()}><Trans>Login</Trans></Button>
      </FormGroup>
      {store.messages.map((msg, idx) => <div key={idx} className="message">{msg}</div>)}
    </form>;
  }
}

RegisterForm.propTypes = {
  store: PropTypes.instanceOf(Store),
  onLogin: PropTypes.func,
  t: PropTypes.func
};

export default RegisterForm;
