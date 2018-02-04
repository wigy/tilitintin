import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Logout extends Component {

  render() {
    const logout = () => {
      this.props.store.logout();
    };

    if (this.props.store.token) {
      return (
          <button onClick={logout}>Logout</button>
      );
    }
    return '';
  }
}));
