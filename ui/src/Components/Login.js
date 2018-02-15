import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

export default inject('store')(observer(class Login extends Component {

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
            <ControlLabel>Käyttäjätunnus</ControlLabel>
            <FormControl type="text" onChange={(event) => user=event.target.value}/>
            <ControlLabel>Salasana</ControlLabel>
            <FormControl type="password" onChange={(event) => password=event.target.value}/>
            <br/>
            <Button onClick={login}>Kirjaudu</Button>
          </FormGroup>
        </form>
      );
    }
    return '';
  }
}));
