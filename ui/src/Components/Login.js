import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Store from '../Stores/Store';
import './Login.css';

@translate('translations')
@inject('store')
@observer
@withRouter
class Login extends Component {

  state = {
    appState: null,
    user: '',
    email: '',
    password: '',
    passwordAgain: ''
  }

  componentDidMount() {
    if (this.props.store.token) {
      this.setState({appState: 'LOGGED_IN'});
    } else {
      this.props.store.request('/status')
        .then((data) => {
          if (data.hasAdminUser) {
            this.setState({appState: 'NOT_LOGGED_IN'});
          } else {
            this.setState({appState: 'NO_ROOT'});
          }
        });
    }
  }

  componentDidUpdate() {
    if (this.props.store.token) {
      if (this.state.appState !== 'LOGGED_IN') {
        this.setState({appState: 'LOGGED_IN'});
      }
    } else {
      if (this.state.appState === 'LOGGED_IN') {
        this.setState({appState: 'NOT_LOGGED_IN'});
      }
    }
  }

  render() {

    const { store } = this.props;

    const onLogin = () => {
      store.login(this.state.user, this.state.password)
        .then(() => this.props.history.push('/'));
    };

    const onRegister = () => {
      if (this.state.password !== this.state.passwordAgain) {
        store.messages.push(this.props.t('Passwords do not match.'));
        return;
      }
      return store.request('/register', 'POST', {admin: true, user: this.state.user, password: this.state.password})
        .then(() => {
          store.login(this.state.user, this.state.password)
            .then(() => {
              this.props.history.push('/_/admin');
            });
        });
    };

    if (this.state.appState === 'NO_ROOT') {
      return <div className="Login">
        <h1><Trans>This system has no admin user</Trans></h1>
        <h2><Trans>Please register an admin user</Trans></h2>
        <form>
          <FormGroup>
            <ControlLabel><Trans>Username</Trans></ControlLabel>
            <FormControl type="text" onChange={(event) => (this.setState({user: event.target.value}))}/>
            <ControlLabel><Trans>Email</Trans></ControlLabel>
            <FormControl type="text" onChange={(event) => (this.setState({email: event.target.value}))}/>
            <ControlLabel><Trans>Password</Trans></ControlLabel>
            <FormControl type="password" onChange={(event) => (this.setState({password: event.target.value}))}/>
            <ControlLabel><Trans>Password Again</Trans></ControlLabel>
            <FormControl type="password" onChange={(event) => (this.setState({passwordAgain: event.target.value}))}/>
            <br/>
            <Button onClick={onRegister}><Trans>Register</Trans></Button>
          </FormGroup>
          {store.messages.map((msg, idx) => <div key={idx} className="message">{msg}</div>)}
        </form>
      </div>;
    }

    if (this.state.appState === 'NOT_LOGGED_IN') {
      return <div className="Login">
        <form>
          <FormGroup>
            <ControlLabel><Trans>Username</Trans></ControlLabel>
            <FormControl type="text" onChange={(event) => (this.setState({user: event.target.value}))}/>
            <ControlLabel><Trans>Password</Trans></ControlLabel>
            <FormControl type="password" onChange={(event) => (this.setState({password: event.target.value}))}/>
            <br/>
            <Button onClick={onLogin}><Trans>Login</Trans></Button>
          </FormGroup>
          {store.messages.map((msg, idx) => <div key={idx} className="message">{msg}</div>)}
        </form>
      </div>;
    }

    return '';
  }
}

Login.propTypes = {
  store: PropTypes.instanceOf(Store),
  history: ReactRouterPropTypes.history,
  t: PropTypes.func
};

export default Login;
