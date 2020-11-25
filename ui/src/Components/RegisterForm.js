import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans, withTranslation } from 'react-i18next';
import Store from '../Stores/Store';
import Panel from './Panel';
import { TextField, Button, FormHelperText } from '@material-ui/core';
import Cursor from '../Stores/Cursor';

@inject('store')
@inject('cursor')
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

  componentDidMount() {
    this.props.cursor.disableHandler();
  }

  componentWillUnmount = () => {
    this.props.cursor.enableHandler();
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
      <Panel>
        <FormHelperText error>
          {store.messages.map((msg, idx) => <React.Fragment key={idx}>{msg}<br/></React.Fragment>)}
        </FormHelperText>
        <TextField
          style={{ width: '50%' }}
          label={<Trans>Username</Trans>}
          onChange={(event) => (this.setState({ user: event.target.value }))}
        />
        <br/>
        <TextField
          style={{ width: '50%' }}
          label={<Trans>Full Name</Trans>}
          onChange={(event) => (this.setState({ name: event.target.value }))}
        />
        <br/>
        <TextField
          style={{ width: '50%' }}
          label={<Trans>Email</Trans>}
          onChange={(event) => (this.setState({ email: event.target.value }))}
        />
        <br/>
        <TextField
          type="password"
          style={{ width: '50%' }}
          label={<Trans>Password</Trans>}
          onChange={(event) => (this.setState({ password: event.target.value }))}
        />
        <br/>
        <TextField
          type="password"
          style={{ width: '50%' }}
          label={<Trans>Password Again</Trans>}
          onChange={(event) => (this.setState({ passwordAgain: event.target.value }))}
        />
        <br/>
        <br/>
        <Button variant="outlined" onClick={() => this.onRegister()}><Trans>Submit</Trans></Button>
      </Panel>
    </form>;
  }
}

RegisterForm.propTypes = {
  store: PropTypes.instanceOf(Store),
  onRegister: PropTypes.func,
  t: PropTypes.func,
  cursor: PropTypes.instanceOf(Cursor)
};

export default RegisterForm;
