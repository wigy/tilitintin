import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Login extends Component {

  render() {
    let user = '';
    let password = '';

    const login = () => {
      this.props.store.login(user, password);
    };

    if (!this.props.store.token) {
      return (
        <div className="Login">
          User: <input onChange={(event) => user=event.target.value} name="user"/><br/>
          Password: <input onChange={(event) => password=event.target.value} name="password" type="password"/><br/>
          <input onClick={login} type="submit"/>
        </div>
      );
    }
    return '';
  }
}));
