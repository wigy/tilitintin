import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

@translate('translations')
@inject('store')
@observer
class Login extends Component {

  render() {
    let user = '';
    let password = '';

    const login = () => {
      this.props.store.login(user, password);
    };

    if (!this.props.store.token) {
      return (
        <form className="Login">
          <FormGroup>
            <ControlLabel><Trans>Username</Trans></ControlLabel>
            <FormControl type="text" onChange={(event) => user = event.target.value}/>
            <ControlLabel><Trans>Password</Trans></ControlLabel>
            <FormControl type="password" onChange={(event) => password = event.target.value}/>
            <br/>
            <Button onClick={login}><Trans>Login</Trans></Button>
          </FormGroup>
        </form>
      );
    }
    return '';
  }
}

export default Login;
