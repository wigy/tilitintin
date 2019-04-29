import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Store from '../Stores/Store';
import './Login.css';

@translate('translations')
@inject('store')
@observer
class Login extends Component {

  state = {
    user: '',
    password: ''
  }
  render() {

    const login = () => {
      this.props.store.login(this.state.user, this.state.password);
    };

    if (!this.props.store.token) {
      return (
        <form className="Login">
          <FormGroup>
            <ControlLabel><Trans>Username</Trans></ControlLabel>
            <FormControl type="text" onChange={(event) => (this.setState({user: event.target.value}))}/>
            <ControlLabel><Trans>Password</Trans></ControlLabel>
            <FormControl type="password" onChange={(event) => (this.setState({password: event.target.value}))}/>
            <br/>
            <Button onClick={login}><Trans>Login</Trans></Button>
          </FormGroup>
          {this.props.store.messages.map((msg, idx) => <div key={idx} className="message">{msg}</div>)}
        </form>
      );
    }
    return '';
  }
}

Login.propTypes = {
  store: PropTypes.instanceOf(Store)
};

export default Login;
